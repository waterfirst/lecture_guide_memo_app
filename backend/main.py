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
    """
    Deprecated: Client now uses client-side Gemini API.
    """
    raise HTTPException(
        status_code=410,
        detail="This endpoint is deprecated. The app now uses client-side Gemini API. Please refresh your browser (Ctrl+F5)."
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
