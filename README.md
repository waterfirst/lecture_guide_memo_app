# Lecture PDF Study App (가이더)

An interactive study web app to analyze English lecture PDFs in Korean with notes and links. This app uses AI to provide concise summaries and explanations for both text-based and image-based PDF slides.

## ✨ Features

- **PDF Viewer**: High-quality PDF rendering via PDF.js with default 70% zoom for optimal viewing.
- **AI AI Script Generation**:
  - **Gemini 3.0 Flash (Multimodal)**: Analyzes image-based or scanned PDFs directly for rich insights.
  - **Ollama (Gemma 3:4b)**: Fast local text-based script generation and translation.
- **Concise Summaries**: AI scripts are optimized to be short, clear, and actionable using bullet points.
- **Draggable Memos**: Take notes directly on any slide and move them where you need.
- **Reference Links**: Save helpful links related to your study material.
- **Local Storage Support**: Your notes, links, and generated scripts are saved locally in your browser.

## 🚀 How to Run

### 1. Frontend Setup
1.  Open `index.html` using a local server (e.g., VS Code Live Server extension).
2.  The frontend is built with Vanilla JS and CSS, so no build step is required.

### 2. Backend Setup (AI Features)
The backend is required for AI script generation.

1.  **Navigate to backend folder**:
    ```bash
    cd backend
    ```
2.  **Create and activate virtual environment**:
    ```bash
    python -m venv venv
    venv\Scripts\activate  # Windows
    source venv/bin/activate  # macOS/Linux
    ```
3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
4.  **Configure Environment Variables**:
    Create a `.env` file in the `backend/` directory:
    ```env
    GOOGLE_API_KEY=your_gemini_api_key_here
    ```
5.  **Run the server**:
    ```bash
    python main.py
    ```
    The server will run on `http://localhost:8000`.

### 3. Local AI (Ollama)
Ensure [Ollama](https://ollama.com/) is installed and the model is pulled:
```bash
ollama pull gemma3:4b
```

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS, Vanilla JavaScript, [PDF.js](https://mozilla.github.io/pdf.js/)
- **Backend**: Python, [FastAPI](https://fastapi.tiangolo.com/), [Ollama](https://ollama.com/), [Google Generative AI (Gemini)](https://ai.google.dev/)
- **Storage**: Browser LocalStorage

## 🔗 Repository
[https://github.com/waterfirst/lecture_guide_memo_app](https://github.com/waterfirst/lecture_guide_memo_app)
