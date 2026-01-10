const StorageManager = {
    // Keys
    STORAGE_KEY: 'lecture_pdf_app_data',

    getData: function () {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : {
            pdfs: {},  // PDF별 데이터 저장
            currentPdfId: null
        };
    },

    saveData: function (data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    },

    // 현재 PDF ID 설정
    setCurrentPdfId: function (pdfId) {
        const data = this.getData();
        data.currentPdfId = pdfId;
        this.saveData(data);
    },

    getCurrentPdfId: function () {
        return this.getData().currentPdfId;
    },

    // PDF별 데이터 초기화
    initPdfData: function (pdfId) {
        const data = this.getData();
        if (!data.pdfs[pdfId]) {
            data.pdfs[pdfId] = {
                notes: [],
                links: [],
                scripts: {}
            };
            this.saveData(data);
        }
        return data.pdfs[pdfId];
    },

    // PDF별 전체 데이터 조회
    getPdfData: function (pdfId) {
        const data = this.getData();
        return data.pdfs[pdfId] || { notes: [], links: [], scripts: {} };
    },

    // PDF별 메모 저장
    saveNotesForPdf: function (pdfId, notes) {
        if (!pdfId) return;
        const data = this.getData();
        if (!data.pdfs[pdfId]) {
            data.pdfs[pdfId] = { notes: [], links: [], scripts: {} };
        }
        data.pdfs[pdfId].notes = notes;
        this.saveData(data);
    },

    // PDF별 메모 조회
    getNotesForPdf: function (pdfId) {
        const pdfData = this.getPdfData(pdfId);
        return pdfData.notes || [];
    },

    // PDF별 링크 저장
    saveLinksForPdf: function (pdfId, links) {
        if (!pdfId) return;
        const data = this.getData();
        if (!data.pdfs[pdfId]) {
            data.pdfs[pdfId] = { notes: [], links: [], scripts: {} };
        }
        data.pdfs[pdfId].links = links;
        this.saveData(data);
    },

    // PDF별 링크 조회
    getLinksForPdf: function (pdfId) {
        const pdfData = this.getPdfData(pdfId);
        return pdfData.links || [];
    },

    // PDF별 스크립트 저장
    saveScript: function (pdfId, pageNum, script) {
        if (!pdfId) return;
        const data = this.getData();
        if (!data.pdfs[pdfId]) {
            data.pdfs[pdfId] = { notes: [], links: [], scripts: {} };
        }
        if (!data.pdfs[pdfId].scripts) {
            data.pdfs[pdfId].scripts = {};
        }
        data.pdfs[pdfId].scripts[pageNum] = script;
        this.saveData(data);
    },

    // PDF별 스크립트 조회
    getScript: function (pdfId, pageNum) {
        const pdfData = this.getPdfData(pdfId);
        if (pdfData.scripts && pdfData.scripts[pageNum]) {
            return pdfData.scripts[pageNum];
        }
        return null;
    },

    // 모든 PDF 저장 (명시적 저장 버튼용)
    saveAll: function (pdfId, notes, links) {
        if (!pdfId) return;
        const data = this.getData();
        if (!data.pdfs[pdfId]) {
            data.pdfs[pdfId] = { notes: [], links: [], scripts: {} };
        }
        data.pdfs[pdfId].notes = notes;
        data.pdfs[pdfId].links = links;
        this.saveData(data);
    }
};

window.StorageManager = StorageManager;
