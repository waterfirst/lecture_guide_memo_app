const Translator = {
    generateBtn: document.getElementById('generate-script'),
    scriptBody: document.getElementById('script-body'),

    init: function () {
        if (this.generateBtn) {
            this.generateBtn.addEventListener('click', () => this.translatePDF());
        }
    },

    translatePDF: async function () {
        const viewer = window.app.viewer;
        if (!viewer || !viewer.pdfDoc) {
            alert('먼저 PDF 파일을 업로드해주세요.');
            return;
        }

        // Check if API key is available and valid for image processing
        const apiKey = window.apiKeyManager ? window.apiKeyManager.getApiKey() : null;
        const isApiKeyValid = window.apiKeyManager ? window.apiKeyManager.isApiKeyValid() : false;

        const pageNum = viewer.currentPage;
        const pdfId = viewer.pdfFile ? viewer.pdfFile.name : 'current_pdf';

        this.setLoading(true);

        try {
            // Extract text from current page
            let text = await viewer.getPageText(pageNum);
            console.log(`Extracted text for P.${pageNum}:`, text);

            const imageData = viewer.getPageImage();

            if (!text.trim() && !imageData) {
                throw new Error('이 페이지에서 텍스트 또는 이미지를 추출할 수 없습니다.');
            }

            // Check if we need API key for image processing
            if (imageData && !isApiKeyValid) {
                alert('이미지 분석을 위해 유효한 Gemini API 키가 필요합니다. 상단에서 API 키를 입력하고 검증해주세요.');
                this.setLoading(false);
                return;
            }

            // Determine backend URL based on environment
            const backendUrl = window.location.origin.includes('localhost')
                ? 'http://localhost:8000'
                : window.location.origin;

            const response = await fetch(`${backendUrl}/translate-page`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    image: imageData,
                    api_key: apiKey // Include API key in request
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 400 && errorData.detail && errorData.detail.includes('Refresh')) {
                    throw new Error('업데이트된 코드를 불러오기 위해 브라우저를 Ctrl+F5로 강력 새로고침 해주세요!');
                }
                throw new Error(errorData.detail || '서버 오류가 발생했습니다.');
            }

            const data = await response.json();
            this.displayScript(data.script);

            // Save to storage
            if (window.StorageManager) {
                window.StorageManager.saveScript(pdfId, pageNum, data.script);
            }
        } catch (error) {
            console.error('Translation error:', error);
            alert(error.message || '번역 중 오류가 발생했습니다. Ollama 서버와 모델(gemma3:4b)이 실행 중인지 확인하세요.');
        } finally {
            this.setLoading(false);
        }
    },

    displayScript: function (markdown) {
        if (!this.scriptBody) return;

        // Simple markdown to HTML conversion (headings and paragraphs)
        let html = markdown
            .replace(/^# (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h4>$1</h4>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');

        this.scriptBody.innerHTML = `<div class="script-content"><p>${html}</p></div>`;
    },

    setLoading: function (isLoading) {
        if (!this.generateBtn) return;
        if (isLoading) {
            this.generateBtn.disabled = true;
            this.generateBtn.textContent = '생성 중...';
            this.scriptBody.innerHTML = '<div class="loader">AI가 스크립트를 생성하고 있습니다...</div>';
        } else {
            this.generateBtn.disabled = false;
            this.generateBtn.textContent = 'AI 스크립트 생성';
        }
    }
};

Translator.init();
window.Translator = Translator;
