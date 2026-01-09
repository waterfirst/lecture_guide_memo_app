class LinkManager {
    constructor() {
        this.links = [];
        this.addBtn = document.getElementById('add-link-btn');
        this.listContainer = document.getElementById('links-list');
        this.currentPage = 1;

        if (this.addBtn) {
            this.addBtn.addEventListener('click', () => this.promptAddLink());
        }

        window.addEventListener('pageRendered', (e) => {
            this.currentPage = e.detail.pageNum;
            this.renderLinks();
        });
    }

    promptAddLink() {
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
        if (window.StorageManager) {
            const data = window.StorageManager.getData();
            data.links = this.links;
            window.StorageManager.saveData(data);
        }
    }

    loadLinks(data) {
        this.links = data || [];
        this.renderLinks();
    }
}

window.linkManager = new LinkManager();
