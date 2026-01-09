const StorageManager = {
    // Keys
    STORAGE_KEY: 'lecture_pdf_app_data',

    getData: function () {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : {
            notes: [],
            links: [],
            scripts: {}
        };
    },

    saveData: function (data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    },

    saveNotes: function (notes) {
        const data = this.getData();
        data.notes = notes;
        this.saveData(data);
    },

    getNotes: function () {
        return this.getData().notes;
    },

    saveScript: function (pdfId, pageNum, script) {
        const data = this.getData();
        if (!data.scripts[pdfId]) data.scripts[pdfId] = {};
        data.scripts[pdfId][pageNum] = script;
        this.saveData(data);
    },

    getScript: function (pdfId, pageNum) {
        const data = this.getData(); // Added this line to define 'data'
        if (data.scripts[pdfId]) {
            return data.scripts[pdfId][pageNum] || null;
        }
        return null;
    }
};

window.StorageManager = StorageManager;
