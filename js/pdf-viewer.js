const pdfjsLib = window['pdfjs-dist/build/pdf'];

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

class PDFViewer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.pdfDoc = null;
        this.currentPage = 1;
        this.scale = 0.7;
        this.pageRendering = false;
        this.pageNumPending = null;

        // UI elements pointers
        this.pageNumSpan = document.getElementById('page-num');
        this.pageCountSpan = document.getElementById('page-count');
        this.zoomValSpan = document.getElementById('zoom-val');
    }

    async loadPDF(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            this.pdfDoc = await loadingTask.promise;

            this.pageCountSpan.textContent = this.pdfDoc.numPages;
            this.currentPage = 1;
            this.renderPage(this.currentPage);

            // TODO: Save to storage
            console.log('PDF loaded successfully');
        } catch (error) {
            console.error('Error loading PDF:', error);
            alert('PDF 로딩 중 오류가 발생했습니다.');
        }
    }

    async renderPage(num) {
        this.pageRendering = true;

        // Get page
        const page = await this.pdfDoc.getPage(num);
        const viewport = page.getViewport({ scale: this.scale });

        this.canvas.height = viewport.height;
        this.canvas.width = viewport.width;

        // Sync overlay size
        const overlay = document.getElementById('notes-overlay');
        if (overlay) {
            overlay.style.width = this.canvas.width + 'px';
            overlay.style.height = this.canvas.height + 'px';
        }

        const renderContext = {
            canvasContext: this.ctx,
            viewport: viewport
        };

        const renderTask = page.render(renderContext);

        try {
            await renderTask.promise;
            this.pageRendering = false;

            if (this.pageNumPending !== null) {
                this.renderPage(this.pageNumPending);
                this.pageNumPending = null;
            }

            this.updateUI();

            // Trigger event for notes to reposition
            window.dispatchEvent(new CustomEvent('pageRendered', { detail: { pageNum: num } }));
        } catch (error) {
            console.error('Error rendering page:', error);
        }
    }

    queueRenderPage(num) {
        if (this.pageRendering) {
            this.pageNumPending = num;
        } else {
            this.renderPage(num);
        }
    }

    prevPage() {
        if (this.currentPage <= 1 || !this.pdfDoc) return;
        this.currentPage--;
        this.queueRenderPage(this.currentPage);
    }

    nextPage() {
        if (this.currentPage >= this.pdfDoc.numPages || !this.pdfDoc) return;
        this.currentPage++;
        this.queueRenderPage(this.currentPage);
    }

    zoomIn() {
        if (this.scale >= 3.0 || !this.pdfDoc) return;
        this.scale += 0.2;
        this.renderPage(this.currentPage);
    }

    zoomOut() {
        if (this.scale <= 0.5 || !this.pdfDoc) return;
        this.scale -= 0.2;
        this.renderPage(this.currentPage);
    }

    updateUI() {
        this.pageNumSpan.textContent = this.currentPage;
        this.zoomValSpan.textContent = `${Math.round(this.scale * 100)}%`;
    }

    async getPageText(num) {
        if (!this.pdfDoc) return "";
        const page = await this.pdfDoc.getPage(num);
        const textContent = await page.getTextContent();
        return textContent.items.map(item => item.str).join(' ');
    }

    getPageImage() {
        if (!this.canvas) return null;
        return this.canvas.toDataURL('image/png');
    }
}
