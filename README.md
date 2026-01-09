# Lecture PDF Study App | 강의 PDF 학습 가이더 (Guider)

[English](#english) | [한국어](#한국어)

---

## English

### 🎯 Purpose
The **Lecture PDF Study App (Guider)** is designed to enhance the learning experience for students studying English-language lecture materials. It bridges the language barrier by providing AI-powered Korean explanations and summaries for English PDF slides, while allowing users to take interactive notes and manage reference links directly on the study material.

### ✨ Key Features
- **Smart PDF Viewer**: Optimized rendering with a default 70% zoom for comfortable reading.
- **Multimodal AI Scripting**: Uses **Gemini 3.0 Flash** to analyze scanned or image-heavy slides and **Ollama (Gemma 3)** for fast local text analysis.
- **Concise Summaries**: AI generates brief, bulleted Korean summaries to help you grasp core concepts quickly.
- **Interactive Memos**: Create, drag, and save memos anywhere on the PDF pages.
- **Reference Management**: Store and access helpful web links related to your lecture.
- **Privacy Focused**: All your notes and AI scripts are saved locally in your browser.

### 🚀 How to Use

#### 1. Quick Start (Frontend)
- Open `index.html` using a local web server (e.g., VS Code Live Server).
- Upload your English lecture PDF.

#### 2. AI Feature Setup (Backend)
To enable AI summaries, you need to run the Python backend:
1.  **Environment**: Activate your virtual environment in the `backend/` folder.
2.  **Requirements**: Install dependencies: `pip install -r requirements.txt`.
3.  **API Key**: Add your `GOOGLE_API_KEY` to `backend/.env` for Gemini image analysis.
4.  **Launch**: Run `python main.py`. The backend runs on `http://localhost:8000`.

#### 3. Local AI (Optional)
- Install [Ollama](https://ollama.com/) and run `ollama pull gemma3:4b` for private, local text processing.

---

## 한국어

### 🎯 목적
**강의 PDF 학습 가이더 (Guider)**는 영어로 된 강의 자료를 학습하는 사용자들을 위한 스마트 학습 도구입니다. 영어 슬라이드의 내용을 AI가 한글로 친절하게 설명하고 요약해줌으로써 언어 장벽을 낮추고, 가독성 높은 인터페이스를 통해 효율적인 학습과 메모 관리를 돕습니다.

### ✨ 주요 기능
- **스마트 PDF 뷰어**: 70% 최적 줌 비율로 쾌적한 가시성 제공.
- **멀티모달 AI 분석**: **Gemini 3.0 Flash**를 통해 이미지가 많은 슬라이드나 스캔된 PDF도 분석하며, **Ollama (Gemma 3)**로 빠른 텍스트 분석 지원.
- **간결한 요약**: 핵심 내용만 불렛 포인트로 정리하여 학습 효율 극대화.
- **인터랙티브 메모**: 슬라이드 어디든 자유롭게 메모를 작성하고 드래그하여 배치.
- **참고 링크 관리**: 학습 중 필요한 웹 링크를 저장하고 바로 확인.
- **개인정보 보호**: 모든 메모와 AI 스크립트는 브라우저 로컬 저장소에만 안전하게 보관됩니다.

### 🚀 사용 방법

#### 1. 빠른 시작 (프론트엔드)
- `index.html` 파일을 로컬 서버(예: VS Code Live Server)로 엽니다.
- 학습할 영어 PDF 파일을 업로드합니다.

#### 2. AI 기능 설정 (백엔드)
AI 스크립트 생성을 위해서는 백엔드 서버 실행이 필요합니다:
1.  **환경**: `backend/` 폴더에서 가상환경을 활성화합니다.
2.  **패키지 설치**: `pip install -r requirements.txt`를 실행합니다.
3.  **API 키**: `backend/.env` 파일에 `GOOGLE_API_KEY`를 입력합니다 (Gemini 이미지 인식용).
4.  **서버 실행**: `python main.py`를 실행합니다. 서버는 `http://localhost:8000`에서 동작합니다.

#### 3. 로컬 AI 사용 (선택 사항)
- [Ollama](https://ollama.com/)를 설치하고 `ollama pull gemma3:4b` 명령어로 로컬 모델을 준비하세요.

---

## 🛠️ Tech Stack
- **Frontend**: HTML5, Vanilla CSS/JS, PDF.js
- **Backend**: Python, FastAPI, Gemini API, Ollama
- **Storage**: LocalStorage

## 🔗 Repository
[https://github.com/waterfirst/lecture_guide_memo_app](https://github.com/waterfirst/lecture_guide_memo_app)
