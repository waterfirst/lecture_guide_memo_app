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

        // Check if API key is available and valid
        const apiKey = window.apiKeyManager ? window.apiKeyManager.getApiKey() : null;
        const isApiKeyValid = window.apiKeyManager ? window.apiKeyManager.isApiKeyValid() : false;

        if (!isApiKeyValid) {
            alert('유효한 Gemini API 키가 필요합니다. 상단에서 API 키를 입력하고 검증해주세요.');
            return;
        }

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

            // Wait for geminiClient to be available
            if (!window.geminiClient) {
                throw new Error('Gemini client is not loaded yet. Please refresh the page.');
            }

            // Use client-side Gemini API
            const data = await window.geminiClient.generateScript(apiKey, text, imageData);
            this.displayScript(data.script);

            // Save to storage
            if (window.StorageManager) {
                window.StorageManager.saveScript(pdfId, pageNum, data.script);
            }
        } catch (error) {
            console.error('Translation error:', error);
            alert(error.message || '스크립트 생성 중 오류가 발생했습니다. API 키를 확인하거나 잠시 후 다시 시도해주세요.');
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
