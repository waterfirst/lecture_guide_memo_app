class LinkManager {
    constructor() {
        this.links = [];
        this.addBtn = document.getElementById('add-link-btn');
        this.listContainer = document.getElementById('links-list');
        this.currentPage = 1;
        this.currentPdfId = null; // 현재 PDF 식별자

        if (this.addBtn) {
            this.addBtn.addEventListener('click', () => this.promptAddLink());
        }

        window.addEventListener('pageRendered', (e) => {
            this.currentPage = e.detail.pageNum;
            this.renderLinks();
        });
    }

    // 현재 PDF ID 설정
    setCurrentPdfId(pdfId) {
        this.currentPdfId = pdfId;
    }

    promptAddLink() {
        if (!this.currentPdfId) {
            alert('PDF 파일을 먼저 업로드해주세요.');
            return;
        }

        const url = prompt('첨부할 URL을 입력하세요:');
        if (!url) return;

        const description = prompt('링크 설명을 입력하세요 (선택):') || url;

        this.addLink(url, description);
    }

    addLink(url, description) {
        const id = 'link_' + Date.now();
        const newLink = {
            id: id,
            pageNum: this.currentPage,
            url: url.startsWith('http') ? url : 'https://' + url,
            description: description,
            addedAt: new Date().toISOString()
        };

        this.links.push(newLink);
        this.saveLinks();
        this.renderLinks();
    }

    deleteLink(id) {
        this.links = this.links.filter(l => l.id !== id);
        this.saveLinks();
        this.renderLinks();
    }

    renderLinks() {
        if (!this.listContainer) return;

        // Optionally filter by page or show all? Guide suggests "reference links list"
        // Let's show all but highlight ones for current page
        if (this.links.length === 0) {
            this.listContainer.innerHTML = '<p class="placeholder">첨부된 링크가 없습니다.</p>';
            return;
        }

        this.listContainer.innerHTML = this.links.map(l => `
            <div class="link-item ${l.pageNum === this.currentPage ? 'current-page' : ''}">
                <div class="link-info">
                    <span class="link-page">P.${l.pageNum}</span>
                    <a href="${l.url}" target="_blank" class="link-url">${l.description}</a>
                </div>
                <button class="delete-link" onclick="window.linkManager.deleteLink('${l.id}')">×</button>
            </div>
        `).join('');
    }

    saveLinks() {
        // PDF별로 저장
        if (window.StorageManager && this.currentPdfId) {
            window.StorageManager.saveLinksForPdf(this.currentPdfId, this.links);
        }
    }

    loadLinks(pdfId) {
        this.currentPdfId = pdfId;
        if (window.StorageManager && pdfId) {
            this.links = window.StorageManager.getLinksForPdf(pdfId) || [];
        } else {
            this.links = [];
        }
        this.renderLinks();
    }

    // 링크 데이터 리셋 (새 PDF 로드 시)
    reset() {
        this.links = [];
        this.currentPdfId = null;
        this.renderLinks();
    }

    // 현재 링크 데이터 반환 (저장하기 버튼용)
    getLinkData() {
        return this.links;
    }
}

window.linkManager = new LinkManager();
