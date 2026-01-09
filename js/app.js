document.addEventListener('DOMContentLoaded', () => {
    const pdfViewer = new PDFViewer('pdf-canvas');

    // UI Elements
    const uploadBtn = document.getElementById('upload-btn');
    const pdfUpload = document.getElementById('pdf-upload');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const tabBtns = document.querySelectorAll('.tab-btn');

    // File Upload
    uploadBtn.addEventListener('click', () => pdfUpload.click());
    pdfUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            pdfViewer.pdfFile = file; // Store for ID
            pdfViewer.loadPDF(file);

            // Initial script load for page 1
            setTimeout(() => updateScriptForCurrentPage(), 500);
        }
    });

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
        links: window.linkManager
    };

    // Load persisted data
    const data = window.StorageManager.getData();
    window.noteManager.loadNotes(data.notes);
    window.linkManager.loadLinks(data.links);

    // Tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
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
});
