class Note {
    constructor(data, manager) {
        this.data = data; // { id, pageNum, position: {x, y}, content, color }
        this.manager = manager;
        this.element = this.createNoteElement();
        this.makeDraggable();
    }

    createNoteElement() {
        const div = document.createElement('div');
        div.className = 'sticky-note';
        div.id = this.data.id;
        div.style.left = `${this.data.position.x}px`;
        div.style.top = `${this.data.position.y}px`;
        div.style.backgroundColor = this.data.color || 'var(--note-yellow)';

        div.innerHTML = `
            <div class="note-header" title="드래그하여 이동"></div>
            <textarea class="note-content" placeholder="메모를 입력하세요...">${this.data.content || ''}</textarea>
            <div class="note-footer">
                <button class="delete-note" title="삭제">삭제</button>
            </div>
        `;

        const textarea = div.querySelector('.note-content');
        textarea.addEventListener('input', (e) => {
            this.data.content = e.target.value;
            this.manager.saveNotes();
        });

        const deleteBtn = div.querySelector('.delete-note');
        deleteBtn.addEventListener('click', () => {
            this.manager.deleteNote(this.data.id);
        });

        return div;
    }

    makeDraggable() {
        let isDragging = false;
        let currentX, currentY, initialX, initialY;
        const header = this.element.querySelector('.note-header');

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            initialX = e.clientX - this.element.offsetLeft;
            initialY = e.clientY - this.element.offsetTop;
            this.element.style.zIndex = 1000;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                // Boundaries check within parent
                const parent = this.element.parentElement;
                const maxX = parent.clientWidth - this.element.clientWidth;
                const maxY = parent.clientHeight - this.element.clientHeight;

                currentX = Math.max(0, Math.min(currentX, maxX));
                currentY = Math.max(0, Math.min(currentY, maxY));

                this.element.style.left = `${currentX}px`;
                this.element.style.top = `${currentY}px`;

                this.data.position = { x: currentX, y: currentY };
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                this.element.style.zIndex = '';
                this.manager.saveNotes();
            }
        });
    }
}

class NoteManager {
    constructor() {
        this.notes = []; // Current notes objects
        this.noteData = []; // Array of { id, pageNum, ... }
        this.container = document.getElementById('notes-overlay');
        this.currentPage = 1;
        this.currentPdfId = null; // 현재 PDF 식별자

        window.addEventListener('pageRendered', (e) => {
            this.currentPage = e.detail.pageNum;
            this.renderNotesForPage(this.currentPage);
        });

        // Double click on viewer area to add note
        const viewerArea = document.querySelector('.viewer-area');
        viewerArea.addEventListener('dblclick', (e) => {
            if (e.target.id === 'notes-overlay' || e.target.id === 'pdf-canvas') {
                const rect = this.container.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.addNote(x, y);
            }
        });

        // Add Note Button
        this.addNoteBtn = document.getElementById('add-note-btn');
        if (this.addNoteBtn) {
            this.addNoteBtn.addEventListener('click', () => {
                // Add note at a default visible position
                this.addNote(50, 50);
            });
        }
    }

    // 현재 PDF ID 설정
    setCurrentPdfId(pdfId) {
        this.currentPdfId = pdfId;
    }

    addNote(x, y) {
        if (!this.currentPdfId) {
            alert('PDF 파일을 먼저 업로드해주세요.');
            return;
        }

        const id = 'note_' + Date.now();
        const data = {
            id: id,
            pageNum: this.currentPage,
            position: { x: x, y: y },
            content: '',
            color: '#FFF9C4'
        };
        this.noteData.push(data);
        this.renderNotesForPage(this.currentPage);
        this.saveNotes();
    }

    deleteNote(id) {
        this.noteData = this.noteData.filter(n => n.id !== id);
        this.renderNotesForPage(this.currentPage);
        this.saveNotes();
    }

    renderNotesForPage(pageNum) {
        this.container.innerHTML = '';
        this.notes = [];
        const pageNotes = this.noteData.filter(n => n.pageNum === pageNum);

        pageNotes.forEach(data => {
            const note = new Note(data, this);
            this.container.appendChild(note.element);
            this.notes.push(note);
        });

        this.updateNotesList();
    }

    updateNotesList() {
        const listContainer = document.getElementById('notes-list');
        if (!listContainer) return;

        if (this.noteData.length === 0) {
            listContainer.innerHTML = '<p class="placeholder">생성된 메모가 없습니다.</p>';
            return;
        }

        listContainer.innerHTML = this.noteData.map(n => `
            <div class="note-list-item" onclick="app.viewer.renderPage(${n.pageNum})">
                <span class="note-page">P.${n.pageNum}</span>
                <p class="note-snippet">${n.content.substring(0, 30) || '(내용 없음)'}...</p>
            </div>
        `).join('');
    }

    saveNotes() {
        // PDF별로 저장
        if (window.StorageManager && this.currentPdfId) {
            window.StorageManager.saveNotesForPdf(this.currentPdfId, this.noteData);
        }
    }

    loadNotes(pdfId) {
        this.currentPdfId = pdfId;
        if (window.StorageManager && pdfId) {
            this.noteData = window.StorageManager.getNotesForPdf(pdfId) || [];
        } else {
            this.noteData = [];
        }
        this.renderNotesForPage(this.currentPage);
    }

    // 메모 데이터 리셋 (새 PDF 로드 시)
    reset() {
        this.noteData = [];
        this.currentPdfId = null;
        this.renderNotesForPage(this.currentPage);
    }

    // 현재 메모 데이터 반환 (저장하기 버튼용)
    getNoteData() {
        return this.noteData;
    }
}

// Initialize and expose
window.noteManager = new NoteManager();
