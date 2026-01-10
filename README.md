# Lecture PDF Study App | 강의 PDF 학습 가이더 (Guider)

[English](#english) | [한국어](#한국어)

---

## English

### 🎯 Purpose
The **Lecture PDF Study App (Guider)** is designed to enhance the learning experience for students studying English-language lecture materials. It bridges the language barrier by providing AI-powered Korean explanations and summaries for English PDF slides, while allowing users to take interactive notes and manage reference links directly on the study material.

### 🔑 Gemini API Key Setup & Security

#### 1. How to get a Gemini API Key
1.  Visit [Google AI Studio](https://aistudio.google.com/).
2.  Sign in with your Google account.
3.  Click on **"Get API key"** in the sidebar.
4.  Create a new API key in a new or existing project.
5.  Copy your API key.

#### 2. How to Configure
In the `backend/` directory, create a file named `.env` and add your key:
```env
GOOGLE_API_KEY=your_actual_api_key_here
```

#### ⚠️ Security Warning (CRITICAL)
> [!CAUTION]
> **NEVER upload your `.env` file or your API key directly to GitHub or any public repository.**
> - Doing so will expose your key, allowing others to use your quota and potentially incur costs.
> - Ensure `.env` is listed in your `.gitignore` file.

---

### ✨ Key Features
- **Smart PDF Viewer**: Optimized rendering with a default 70% zoom for comfortable reading.
- **Multimodal AI Scripting**: Uses **Gemini 3.0 Flash** to analyze scanned or image-heavy slides.
- **Concise Summaries**: AI generates brief, bulleted Korean summaries.
- **Interactive Memos & Links**: Manage notes and references directly on PDF pages.
- **Privacy Focused**: All data is saved locally in your browser's LocalStorage.

---

## 한국어

### 🎯 목적
**강의 PDF 학습 가이더 (Guider)**는 영어 강의 자료 학습을 돕는 스마트 도구입니다. AI를 활용해 영어 슬라이드를 한글로 요약/설명하고, 인터랙티브 메모와 링크 관리 기능을 통해 학습 효율을 높여줍니다.

### 🔑 Gemini API 키 발급 및 설정 방법

#### 1. API 키 발급 받기
1.  [Google AI Studio](https://aistudio.google.com/)에 접속합니다.
2.  구글 계정으로 로그인합니다.
3.  사이드바에서 **"Get API key"**를 클릭합니다.
4.  새 프로젝트 또는 기존 프로젝트에서 API 키를 생성합니다.
5.  생성된 API 키를 복사합니다.

#### 2. 설정 방법
`backend/` 디렉토리에 `.env` 파일을 생성하고 다음과 같이 키를 입력합니다:
```env
GOOGLE_API_KEY=발급받은_API_키_입력
```

#### ⚠️ 보안 경고 (필독)
> [!CAUTION]
> **절대로 `.env` 파일이나 API 키를 GitHub 등 공개 저장소에 직접 업로드하지 마세요.**
> - 키가 노출되면 타인이 사용자의 할당량을 소모하거나 비용을 발생시킬 수 있습니다.
> - 반드시 `.gitignore` 파일에 `.env`가 포함되어 있는지 확인하세요.

---

### ✨ 주요 기능
- **스마트 PDF 뷰어**: 70% 최적 줌 비율 기본 제공.
- **멀티모달 AI 분석**: **Gemini 3.0 Flash**로 이미지와 텍스트를 동시에 분석.
- **간결한 요약**: 핵심 내용 중심의 불렛 포인트 요약.
- **메모 및 링크 관리**: PDF 페이지 위에 직접 메모를 작성하고 링크를 저장.
- **개인정보 보호**: 모든 데이터는 브라우저 로컬 저장소에 저장됩니다.

---

## 🚀 How to Run | 실행 방법

1.  **Frontend**: Open `index.html` with a local server (e.g., Live Server).
2.  **Backend**:
    - Go to `backend/` folder. - `cd backend`
    - Setup python venv: `python -m venv venv`.
    - actiate venv : `venv/Scripts/activate`,
    - Install dependencies: `pip install -r requirements.txt`.
    - Run: `python main.py` (Runs on `index.html` : liveserver).

## 🛠️ Tech Stack
HTML5, Vanilla CSS/JS, PDF.js, Python, FastAPI, Gemini API, Ollama

## 🔗 Repository
[https://github.com/waterfirst/lecture_guide_memo_app](https://github.com/waterfirst/lecture_guide_memo_app)
