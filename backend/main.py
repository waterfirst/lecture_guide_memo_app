import os
import io
import base64
import traceback
import warnings
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Suppress FutureWarning for google.generativeai deprecation
warnings.filterwarnings("ignore", category=FutureWarning, module="google.generativeai")

import google.generativeai as genai
import pdfplumber
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Get the parent directory where index.html, css/, js/ are located
FRONTEND_DIR = Path(__file__).parent.parent

# Mount static files for CSS and JS
app.mount("/css", StaticFiles(directory=FRONTEND_DIR / "css"), name="css")
app.mount("/js", StaticFiles(directory=FRONTEND_DIR / "js"), name="js")

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    print("Warning: GOOGLE_API_KEY not found in environment variables.")

import ollama

@app.get("/")
async def root():
    """Serve the main index.html page"""
    return FileResponse(FRONTEND_DIR / "index.html")

@app.get("/favicon.ico")
async def favicon():
    """Handle favicon requests (return 204 No Content if no favicon exists)"""
    favicon_path = FRONTEND_DIR / "favicon.ico"
    if favicon_path.exists():
        return FileResponse(favicon_path)
    return {"status": "no favicon"}

@app.post("/validate-api-key")
async def validate_api_key(data: dict):
    """Validate a Gemini API key by attempting to list models"""
    api_key = data.get("api_key")

    if not api_key:
        raise HTTPException(status_code=400, detail="No API key provided")

    try:
        # Configure genai with the provided API key
        genai.configure(api_key=api_key)

        # Try to list models to validate the key
        models = list(genai.list_models())

        if models:
            return {"valid": True, "message": "API key is valid"}
        else:
            return {"valid": False, "message": "No models available"}

    except Exception as e:
        print(f"API key validation failed: {str(e)}")
        return {"valid": False, "message": f"Invalid API key: {str(e)}"}

@app.post("/translate-pdf")
async def translate_pdf_fallback():
    # This is a fallback for cached frontends.
    # Tell the user to refresh their browser.
    raise HTTPException(status_code=400, detail="Outdated client version. Please refresh your browser (Ctrl+F5).")

@app.post("/verify-api-key")
async def verify_api_key(data: dict):
    key = data.get("api_key")
    if not key:
        raise HTTPException(status_code=400, detail="API key is required")
    
    try:
        genai.configure(api_key=key)
        print("--- Available Gemini Models ---")
        available_models = []
        for m in genai.list_models():
            print(f"Name: {m.name}, Methods: {m.supported_generation_methods}")
            available_models.append(m.name)
        
        # Just check if we can at least list models
        return {"status": "success", "message": "API key is valid", "models": available_models}
    except Exception as e:
        print(f"API Key verification failed: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid API key: {str(e)}")

@app.post("/translate-page")
async def translate_page(data: dict):
    text = data.get("text", "")
<<<<<<< HEAD
    image_data = data.get("image")
=======
    image_data = data.get("image") # Base64 encoded image
    request_api_key = data.get("api_key") # Key from request body
    
    # Use key from request if provided, otherwise fallback to env
    current_api_key = request_api_key or api_key
>>>>>>> 10afcff (feat: add Gemini API key verification and dynamic model selection)
    
    # .env에서 로드된 서버의 API 키 사용
    server_api_key = os.getenv("GOOGLE_API_KEY")
    
    try:
<<<<<<< HEAD
        if image_data and server_api_key:
            genai.configure(api_key=server_api_key)
=======
        # If we have an image and a valid API key, use Gemini
        if image_data and current_api_key:
            print("Using Gemini for multimodal translation")
            genai.configure(api_key=current_api_key)
            
            # Remove header if present (e.g., "data:image/png;base64,")
>>>>>>> 10afcff (feat: add Gemini API key verification and dynamic model selection)
            if "," in image_data:
                image_data = image_data.split(",")[1]
            image_bytes = base64.b64decode(image_data)
<<<<<<< HEAD

            # 모델명을 gemini-1.5-flash-latest로 설정 (가장 안정적)
            model = genai.GenerativeModel('gemini-1.5-flash-latest')

            prompt = "다음 슬라이드를 한글로 요약해줘. 불렛 포인트 마크다운 형식을 사용해."
            response = model.generate_content([
                prompt,
                {"mime_type": "image/png", "data": image_bytes}
            ])
            return {"script": response.text}

    print(f"Received translation request. Text length: {len(text)}, Image present: {bool(image_data)}, API key present: {bool(user_api_key)}")

    try:
        # If we have an image and user provided API key, use Gemini
        if image_data and user_api_key:
            print("Using Gemini for multimodal translation with user-provided API key")

            # Configure genai with user's API key
            genai.configure(api_key=user_api_key)

            # Remove header if present (e.g., "data:image/png;base64,")
            if "," in image_data:
                image_data = image_data.split(",")[1]

            # Decode base64 to bytes
            image_bytes = base64.b64decode(image_data)

            # Using gemini-3-flash-preview as requested (Gemini 3.0 Flash)
            model = genai.GenerativeModel('gemini-3-flash-preview')

            prompt = "다음 슬라이드 이미지를 핵심 요약 위주로 매우 간결하게 한글로 설명해줘. 불필요한 서술은 제외하고 가독성 좋게 불렛 포인트 마크다운 형식으로 작성해줘."
            if text:
                prompt += f"\n\n참고 텍스트: {text}"

            response = model.generate_content([
                prompt,
                {"mime_type": "image/png", "data": image_bytes}
            ])

            return {"script": response.text}
=======
            
            def get_vision_model_name():
                available = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
                # Filter for models that likely support images (vision/multimodal)
                vision_models = [name for name in available if 'flash' in name.lower() or 'pro' in name.lower()]
                if vision_models:
                    print(f"Dynamically selected vision model: {vision_models[0]}")
                    return vision_models[0]
                return 'gemini-1.5-flash' # Absolute fallback

            # Try primary choice
            try:
                model_name = 'gemini-1.5-flash'
                model = genai.GenerativeModel(model_name)
                prompt = "다음 슬라이드 이미지를 핵심 요약 위주로 매우 간결하게 한글로 설명해줘. 불필요한 서술은 제외하고 가독성 좋게 불렛 포인트 마크다운 형식으로 작성해줘."
                if text:
                    prompt += f"\n\n참고 텍스트: {text}"
                
                response = model.generate_content([
                    prompt,
                    {"mime_type": "image/png", "data": image_bytes}
                ])
                return {"script": response.text}
            except Exception as e:
                print(f"Attempt with gemini-1.5-flash failed: {str(e)}")
                if "404" in str(e) or "not found" in str(e).lower():
                    # Dynamic fallback
                    model_name = get_vision_model_name()
                    print(f"Retrying with dynamic model: {model_name}")
                    model = genai.GenerativeModel(model_name)
                    response = model.generate_content([
                        prompt,
                        {"mime_type": "image/png", "data": image_bytes}
                    ])
                    return {"script": response.text}
                raise e

>>>>>>> 10afcff (feat: add Gemini API key verification and dynamic model selection)

        # Fallback to Ollama for text-only processing
        if text:
            model_name = "gemma3:4b"
            print(f"Calling Ollama with model: {model_name}")

            prompt = f"다음 영어 강의 텍스트를 핵심 요약 위주로 매우 간결하게 한글로 설명해줘. 불필요한 내용은 빼고 가독성 좋은 마크다운 불렛 포인트로 작성해줘:\n\n{text}"

            response = ollama.generate(model=model_name, prompt=prompt)
            print("Ollama response received successfully")

            return {"script": response['response']}

        raise HTTPException(status_code=400, detail="Gemini API key not provided and no extractable text found.")

    except Exception as e:
        print(f"Exception occurred during translation: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
