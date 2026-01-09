# 강의 PDF 학습 웹앱 개발 가이드

## 📋 프로젝트 개요

영어로 된 강의 PDF를 한글로 분석하고, 메모와 참고 자료를 추가할 수 있는 인터랙티브 학습 웹앱

### 주요 기능
1. ✅ PDF 파일 로드 및 뷰어
2. ✅ AI 기반 한글 스크립트 자동 생성
3. ✅ 참고 자료/URL 링크 첨부
4. ✅ 쪽지 형식 메모 기능 (드래그 가능)
5. ✅ 로컬 저장 (LocalStorage)
6. ✅ GitHub Pages 배포

---

## 🛠 기술 스택

### Frontend
- **HTML5**: 웹앱 구조
- **CSS3**: 반응형 디자인, 애니메이션
- **JavaScript (ES6+)**: 핵심 로직
- **PDF.js**: PDF 렌더링 라이브러리

### AI/Backend (선택사항)
- **Python + FastAPI**: PDF 텍스트 추출 및 번역 API
- **Google Gemini API** 또는 **Claude API**: 한글 스크립트 생성
- **PyPDF2/pdfplumber**: PDF 텍스트 추출

### 데이터 저장
- **LocalStorage**: 브라우저 로컬 저장
- **IndexedDB**: 대용량 데이터 (PDF 파일 자체)
- **GitHub**: 코드 버전 관리

---

## 📁 프로젝트 구조

```
lecture-pdf-study-app/
├── index.html              # 메인 HTML
├── css/
│   ├── style.css          # 메인 스타일
│   └── notes.css          # 메모 전용 스타일
├── js/
│   ├── app.js             # 앱 초기화
│   ├── pdf-viewer.js      # PDF 로드/렌더링
│   ├── translator.js      # AI 번역 연동
│   ├── notes.js           # 메모 기능
│   ├── links.js           # 참고 자료 관리
│   └── storage.js         # 로컬 저장소 관리
├── lib/
│   └── pdf.min.js         # PDF.js 라이브러리
├── data/
│   └── sample.pdf         # 샘플 PDF (선택)
├── backend/ (선택사항)
│   ├── main.py            # FastAPI 서버
│   ├── translator.py      # PDF 번역 모듈
│   └── requirements.txt   # Python 패키지
├── .gitignore
└── README.md
```

---

## 🚀 개발 단계별 가이드

### **Phase 1: 기본 구조 설정 (1-2일)**

#### 1.1 GitHub 저장소 생성
```bash
# 로컬에서 프로젝트 시작
mkdir lecture-pdf-study-app
cd lecture-pdf-study-app
git init

# GitHub에 저장소 생성 후
git remote add origin https://github.com/your-username/lecture-pdf-study-app.git
```

#### 1.2 기본 HTML 구조
핵심 요소:
- PDF 업로드 버튼
- PDF 뷰어 영역
- 사이드바 (스크립트, 메모 목록)
- 플로팅 메모 컨테이너

#### 1.3 PDF.js 라이브러리 설정
```html
<!-- CDN 방식 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
```

---

### **Phase 2: PDF 로드 및 뷰어 (2-3일)**

#### 2.1 기능 목록
- [x] 파일 선택 대화상자
- [x] PDF 렌더링 (캔버스)
- [x] 페이지 네비게이션 (이전/다음)
- [x] 줌 인/아웃
- [x] 전체 화면 모드

#### 2.2 핵심 코드 구조
```javascript
// pdf-viewer.js 예시
class PDFViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.pdfDoc = null;
    this.currentPage = 1;
    this.scale = 1.5;
  }
  
  async loadPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    this.pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
    this.renderPage(this.currentPage);
  }
  
  async renderPage(pageNum) {
    const page = await this.pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: this.scale });
    // 캔버스에 렌더링...
  }
}
```

#### 2.3 테스트 체크리스트
- [ ] PDF 파일 선택 시 정상 로드
- [ ] 페이지 전환 동작
- [ ] 줌 기능 정상 작동
- [ ] 모바일 반응형 확인

---

### **Phase 3: AI 번역 및 스크립트 생성 (3-4일)**

#### 3.1 선택지 비교

| 방식 | 장점 | 단점 | 추천도 |
|------|------|------|--------|
| **클라이언트 직접 호출** | 간단, 서버 불필요 | API 키 노출 위험 | ⭐⭐ |
| **Python 백엔드** | 안전, 전처리 가능 | 배포 복잡 | ⭐⭐⭐⭐ |
| **Cloudflare Workers** | 서버리스, 빠름 | 러닝 커브 | ⭐⭐⭐ |

#### 3.2 권장 방식: Python FastAPI 백엔드
```python
# backend/main.py 예시
from fastapi import FastAPI, UploadFile
import anthropic
import pdfplumber

app = FastAPI()

@app.post("/translate-pdf")
async def translate_pdf(file: UploadFile):
    # PDF 텍스트 추출
    with pdfplumber.open(file.file) as pdf:
        text = "\n".join([page.extract_text() for page in pdf.pages])
    
    # Claude API로 번역
    client = anthropic.Anthropic(api_key="YOUR_KEY")
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=8000,
        messages=[{
            "role": "user",
            "content": f"다음 영어 강의 자료를 한글로 번역하고 핵심 요약을 추가해줘:\n\n{text}"
        }]
    )
    
    return {"script": message.content[0].text}
```

#### 3.3 프론트엔드 연동
```javascript
// translator.js
async function translatePDF(pdfFile) {
  const formData = new FormData();
  formData.append('file', pdfFile);
  
  const response = await fetch('http://localhost:8000/translate-pdf', {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  displayScript(data.script);
}
```

---

### **Phase 4: 메모 기능 구현 (2-3일)**

#### 4.1 메모 기능 상세
- **쪽지 형식**: 작은 박스 형태
- **드래그 가능**: 원하는 위치에 배치
- **컬러 선택**: 노란색, 파란색, 핑크 등
- **PDF 페이지 연결**: 어느 페이지의 메모인지 저장

#### 4.2 메모 데이터 구조
```javascript
// 메모 객체 예시
const note = {
  id: 'note_1234567890',
  pageNum: 3,
  position: { x: 100, y: 200 },
  width: 200,
  height: 150,
  color: 'yellow',
  content: '이 부분은 시험에 나올 것 같음!',
  createdAt: '2025-01-09T10:30:00Z',
  links: [] // 관련 링크들
};
```

#### 4.3 드래그 구현
```javascript
// notes.js 핵심 로직
class Note {
  constructor(data) {
    this.element = this.createNoteElement(data);
    this.makeDraggable();
  }
  
  makeDraggable() {
    let isDragging = false;
    let currentX, currentY, initialX, initialY;
    
    this.element.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('note-header')) {
        isDragging = true;
        initialX = e.clientX - this.element.offsetLeft;
        initialY = e.clientY - this.element.offsetTop;
      }
    });
    
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        this.element.style.left = currentX + 'px';
        this.element.style.top = currentY + 'px';
      }
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
      this.savePosition();
    });
  }
}
```

---

### **Phase 5: 링크 첨부 기능 (1-2일)**

#### 5.1 링크 추가 UI
```html
<!-- 링크 추가 다이얼로그 -->
<div class="link-dialog">
  <input type="text" placeholder="URL 입력" id="link-url">
  <input type="text" placeholder="설명 (선택)" id="link-desc">
  <button onclick="addLink()">추가</button>
</div>
```

#### 5.2 링크 데이터 구조
```javascript
const linkData = {
  id: 'link_123',
  pageNum: 5,
  url: 'https://en.wikipedia.org/wiki/Machine_Learning',
  description: '머신러닝 기초 개념',
  position: { x: 300, y: 150 }, // PDF 위 아이콘 위치
  addedAt: '2025-01-09T11:00:00Z'
};
```

#### 5.3 링크 표시
- PDF 위에 📎 아이콘으로 표시
- 호버 시 설명 툴팁
- 클릭 시 새 탭으로 열기

---

### **Phase 6: 로컬 저장소 (1일)**

#### 6.1 저장할 데이터
```javascript
// storage.js
const appData = {
  pdfFiles: {
    'pdf_hash_123': {
      name: 'lecture01.pdf',
      uploadedAt: '2025-01-09',
      lastAccessed: '2025-01-09T12:00:00Z'
    }
  },
  scripts: {
    'pdf_hash_123': '번역된 한글 스크립트...'
  },
  notes: {
    'pdf_hash_123': [/* 메모 배열 */]
  },
  links: {
    'pdf_hash_123': [/* 링크 배열 */]
  }
};
```

#### 6.2 IndexedDB 활용 (대용량 PDF)
```javascript
// PDF 파일은 IndexedDB에 저장
async function savePDFToIndexedDB(file, hash) {
  const db = await openDatabase();
  const transaction = db.transaction(['pdfs'], 'readwrite');
  const store = transaction.objectStore('pdfs');
  
  await store.put({
    hash: hash,
    file: file,
    uploadedAt: new Date()
  });
}
```

---

### **Phase 7: 스타일링 및 UX (2-3일)**

#### 7.1 디자인 가이드라인
- **컬러 팔레트**:
  - Primary: `#4A90E2` (파란색)
  - Secondary: `#F5A623` (주황색)
  - Background: `#F8F9FA`
  - Note Yellow: `#FFF9C4`
  
- **폰트**:
  - 제목: `Noto Sans KR Bold`
  - 본문: `Noto Sans KR Regular`
  - 코드: `JetBrains Mono`

#### 7.2 반응형 브레이크포인트
```css
/* 모바일 */
@media (max-width: 768px) {
  .sidebar { width: 100%; }
  .pdf-viewer { margin-top: 50px; }
}

/* 태블릿 */
@media (min-width: 769px) and (max-width: 1024px) {
  .sidebar { width: 35%; }
}

/* 데스크톱 */
@media (min-width: 1025px) {
  .sidebar { width: 25%; }
}
```

---

### **Phase 8: GitHub 배포 (1일)**

#### 8.1 GitHub Pages 설정
```bash
# gh-pages 브랜치 생성
git checkout -b gh-pages
git push origin gh-pages

# GitHub 저장소 Settings > Pages > Source를 gh-pages로 설정
```

#### 8.2 자동 배포 (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

---

## 🎯 개발 우선순위

### 🔴 필수 기능 (MVP)
1. PDF 로드 및 기본 뷰어
2. 간단한 메모 기능 (고정 위치)
3. LocalStorage 저장
4. GitHub Pages 배포

### 🟡 중요 기능
1. AI 번역 스크립트
2. 드래그 가능한 메모
3. 링크 첨부

### 🟢 추가 기능 (나중에)
1. 메모 검색 기능
2. PDF 내 텍스트 하이라이트
3. 다크 모드
4. 메모/링크 공유 (JSON 내보내기)
5. 음성 메모 (Web Speech API)

---

## ⚠️ 주의사항 및 팁

### 보안
- ❌ API 키를 프론트엔드 코드에 직접 넣지 말 것
- ✅ 백엔드 API 또는 환경 변수 사용
- ✅ GitHub에 `.env` 파일 업로드 금지 (`.gitignore` 추가)

### 성능
- PDF 파일 크기 제한 (권장: 10MB 이하)
- 대용량 PDF는 페이지별 로드 (lazy loading)
- 메모 100개 이상 시 가상화 고려

### 브라우저 호환성
- Chrome/Edge: 완벽 지원
- Firefox: PDF.js 네이티브 지원
- Safari: 일부 기능 폴리필 필요
- 모바일: 터치 이벤트 별도 처리

---

## 📚 참고 자료

### 라이브러리 & API
- [PDF.js 공식 문서](https://mozilla.github.io/pdf.js/)
- [Claude API 문서](https://docs.anthropic.com/)
- [FastAPI 문서](https://fastapi.tiangolo.com/)
- [IndexedDB MDN](https://developer.mozilla.org/ko/docs/Web/API/IndexedDB_API)

### 유사 프로젝트
- [PDF.js Viewer Example](https://mozilla.github.io/pdf.js/web/viewer.html)
- [Notion Web Clipper](https://www.notion.so/web-clipper)

---

## 🧪 테스트 계획

### 단위 테스트
- [ ] PDF 로드 함수
- [ ] 메모 CRUD 함수
- [ ] 저장소 읽기/쓰기

### 통합 테스트
- [ ] PDF → 번역 → 표시 플로우
- [ ] 메모 생성 → 드래그 → 저장
- [ ] 페이지 새로고침 후 데이터 복원

### 사용자 테스트
- [ ] 실제 강의 PDF로 30분 사용
- [ ] 모바일 환경 테스트
- [ ] 다양한 PDF 형식 (스캔 PDF, 텍스트 PDF)

---

## 📈 향후 확장 아이디어

### AI 기능 강화
- 📝 **자동 요약**: 각 페이지 핵심 요약
- 🤖 **챗봇**: PDF 내용 기반 질문 답변
- 🎯 **중요도 점수**: AI가 중요한 부분 하이라이트

### 협업 기능
- 👥 **공유 모드**: 친구와 메모 공유
- 💬 **댓글 스레드**: 메모에 댓글 달기
- 📊 **학습 분석**: 공부 시간, 메모 수 통계

### 모바일 앱
- React Native 또는 Flutter로 네이티브 앱 개발
- 오프라인 모드 지원
- 푸시 알림 (복습 알림)

---

## 🚀 시작하기

```bash
# 1. 저장소 클론 (아직 없으면 생성)
git clone https://github.com/your-username/lecture-pdf-study-app.git
cd lecture-pdf-study-app

# 2. 기본 구조 생성
mkdir -p css js lib data backend

# 3. 백엔드 (선택사항)
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install fastapi uvicorn anthropic pdfplumber python-multipart

# 4. 개발 서버 실행
# 프론트엔드: Live Server (VS Code 확장) 또는
python -m http.server 8080

# 백엔드 (별도 터미널):
cd backend
uvicorn main:app --reload
```

---

## ✅ 체크리스트

### 초기 설정
- [ ] GitHub 저장소 생성
- [ ] 프로젝트 폴더 구조 생성
- [ ] `.gitignore` 작성
- [ ] README.md 작성

### Phase별 완료
- [ ] Phase 1: 기본 구조
- [ ] Phase 2: PDF 뷰어
- [ ] Phase 3: AI 번역
- [ ] Phase 4: 메모 기능
- [ ] Phase 5: 링크 기능
- [ ] Phase 6: 저장소
- [ ] Phase 7: 스타일링
- [ ] Phase 8: 배포

### 최종 검수
- [ ] 모든 기능 테스트 완료
- [ ] 모바일 반응형 확인
- [ ] 코드 정리 및 주석
- [ ] README 업데이트
- [ ] 라이선스 추가

---

**📌 다음 단계**: 이 가이드를 기반으로 `index.html` 기본 템플릿 작성부터 시작하세요!
