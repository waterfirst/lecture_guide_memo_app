document.addEventListener('DOMContentLoaded', () => {
    const pdfViewer = new PDFViewer('pdf-canvas');
    let currentPdfId = null;

    // UI Elements
    const uploadBtn = document.getElementById('upload-btn');
    const pdfUpload = document.getElementById('pdf-upload');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const saveBtn = document.getElementById('save-btn');

    // File Upload
    uploadBtn.addEventListener('click', () => pdfUpload.click());
    pdfUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            // PDF ID로 파일명 사용
            currentPdfId = file.name;
            pdfViewer.pdfFile = file;

            // StorageManager에 현재 PDF ID 저장
            window.StorageManager.setCurrentPdfId(currentPdfId);
            window.StorageManager.initPdfData(currentPdfId);

            // 해당 PDF의 저장된 메모/링크 불러오기
            window.noteManager.loadNotes(currentPdfId);
            window.linkManager.loadLinks(currentPdfId);

            // PDF 로드
            pdfViewer.loadPDF(file);

            // 현재 PDF 표시
            updateCurrentPdfDisplay();

            // Initial script load for page 1
            setTimeout(() => updateScriptForCurrentPage(), 500);
        }
    });

    // 저장하기 버튼 이벤트
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            if (!currentPdfId) {
                alert('저장할 PDF가 없습니다. 먼저 PDF를 업로드해주세요.');
                return;
            }

            // 현재 메모와 링크를 저장
            const notes = window.noteManager.getNoteData();
            const links = window.linkManager.getLinkData();
            window.StorageManager.saveAll(currentPdfId, notes, links);

            alert('저장되었습니다!');
        });
    }

    // 현재 PDF 표시 업데이트
    function updateCurrentPdfDisplay() {
        const pdfNameDisplay = document.getElementById('current-pdf-name');
        if (pdfNameDisplay && currentPdfId) {
            pdfNameDisplay.textContent = currentPdfId;
            pdfNameDisplay.title = currentPdfId;
        }
    }

    // Listen for page changes to update script view
    window.addEventListener('pageRendered', (e) => {
        updateScriptForCurrentPage();
    });

    function updateScriptForCurrentPage() {
        if (!pdfViewer.pdfFile) return;

        const pdfId = pdfViewer.pdfFile.name;
        const pageNum = pdfViewer.currentPage;
        const savedScript = window.StorageManager.getScript(pdfId, pageNum);

        if (savedScript) {
            window.Translator.displayScript(savedScript);
        } else {
            window.Translator.scriptBody.innerHTML = '<p class="placeholder">이 페이지의 스크립트가 없습니다. 생성 버튼을 눌러보세요.</p>';
        }
    }

    // Navigation
    prevBtn.addEventListener('click', () => pdfViewer.prevPage());
    nextBtn.addEventListener('click', () => pdfViewer.nextPage());

    // Zoom
    zoomInBtn.addEventListener('click', () => pdfViewer.zoomIn());
    zoomOutBtn.addEventListener('click', () => pdfViewer.zoomOut());

    // Initial Load
    window.app = {
        viewer: pdfViewer,
        notes: window.noteManager,
        links: window.linkManager,
        getCurrentPdfId: () => currentPdfId
    };

    // 앱 시작 시 이전 PDF의 데이터를 자동으로 불러오지 않음
    // PDF를 업로드할 때만 해당 PDF의 데이터를 불러옴

    // Tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('locked')) {
                showApiKeyModal();
                return;
            }
            const tabId = btn.getAttribute('data-tab');

            // Toggle buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Toggle panes
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // API Key Logic
    const apiKeyModal = document.getElementById('api-key-modal');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    const scriptTabBtn = document.querySelector('.tab-btn[data-tab="script"]');

    function checkApiKey() {
        const apiKey = window.StorageManager.getApiKey();
        if (!apiKey) {
            scriptTabBtn.classList.add('locked');
            // Show modal immediately on check if key is missing
            showApiKeyModal();
        } else {
            scriptTabBtn.classList.remove('locked');
        }
    }

    function showApiKeyModal() {
        apiKeyModal.classList.add('active');
    }

    saveApiKeyBtn.addEventListener('click', async () => {
        const key = apiKeyInput.value.trim();
        if (!key) {
            alert('API Key를 입력해주세요.');
            return;
        }

        saveApiKeyBtn.disabled = true;
        saveApiKeyBtn.textContent = '검증 중...';

        try {
            const response = await fetch('http://localhost:8000/verify-api-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ api_key: key })
            });

            if (response.ok) {
                window.StorageManager.saveApiKey(key);
                alert('API Key가 성공적으로 검증되었습니다!');
                apiKeyModal.classList.remove('active');
                checkApiKey();
                // Click the script tab to show it
                scriptTabBtn.click();
            } else {
                const error = await response.json();
                throw new Error(error.detail || '검증 실패');
            }
        } catch (error) {
            alert('API Key 검증 오류: ' + error.message);
        } finally {
            saveApiKeyBtn.disabled = false;
            saveApiKeyBtn.textContent = '저장 및 검증';
        }
    });

    // Initial check
    checkApiKey();
});
