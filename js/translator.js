// js/translator.js 수정본
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

        const pageNum = viewer.currentPage;
        const pdfId = viewer.pdfFile ? viewer.pdfFile.name : 'current_pdf';

        this.setLoading(true);

        try {
            const text = await viewer.getPageText(pageNum);
            const imageData = viewer.getPageImage();

            if (!text.trim() && !imageData) {
                throw new Error('이 페이지에서 텍스트 또는 이미지를 추출할 수 없습니다.');
            }

            // [변경] 브라우저 SDK 대신 백엔드 API 호출
            const response = await fetch('/translate-page', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    image: imageData
                    // API 키는 백엔드의 .env를 사용하므로 여기서 보내지 않음
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || '백엔드 요청 실패');
            }

            const data = await response.json();
            this.displayScript(data.script);

            if (window.StorageManager) {
                window.StorageManager.saveScript(pdfId, pageNum, data.script);
            }
        } catch (error) {
            console.error('Translation error:', error);
            alert(error.message);
        } finally {
            this.setLoading(false);
        }
    },

    displayScript: function (markdown) {
        if (!this.scriptBody) return;
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
            this.scriptBody.innerHTML = '<div class="loader">AI가 백엔드에서 스크립트를 생성하고 있습니다...</div>';
        } else {
            this.generateBtn.disabled = false;
            this.generateBtn.textContent = 'AI 스크립트 생성';
        }
    }
};

Translator.init();
