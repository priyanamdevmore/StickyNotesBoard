let noteId = 0;
let draggedNote = null;

function addNote(content = '', color = '#f5f7fa', id = null) {
    const note = document.createElement('div');
    note.className = 'note new';
    note.dataset.id = id !== null ? id : noteId;
    noteId = Math.max(noteId, Number(note.dataset.id) + 1);
    note.style.background = color;

    note.innerHTML = `
        <div class="note-header">
            <div></div>
            <div class="note-actions">
                <button class="note-action" onclick="changeNoteColor(event)" title="Change Color">🎨</button>
                <button class="note-action delete-btn" onclick="deleteNote(${note.dataset.id})" title="Delete">✕</button>
            </div>
        </div>
        <textarea placeholder="Write your thoughts here..." ${content ? '' : 'onfocus="this.placeholder=\'\'"'}>${content}</textarea>
    `;

    document.getElementById('board').appendChild(note);
    makeDraggable(note);
    bindNoteEvents(note);
    updateNoteCount();
    saveNotes();

    const textarea = note.querySelector('textarea');
    textarea.focus();
}

function bindNoteEvents(note) {
    const textarea = note.querySelector('textarea');
    textarea.addEventListener('input', saveNotes);
}

function makeDraggable(note) {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    note.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'TEXTAREA' || e.target.closest('.note-action')) return;

        isDragging = true;
        draggedNote = note;
        note.classList.add('dragging');

        startX = e.clientX;
        startY = e.clientY;
        initialX = note.offsetLeft;
        initialY = note.offsetTop;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (!isDragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        note.style.left = (initialX + dx) + 'px';
        note.style.top = (initialY + dy) + 'px';
        note.style.position = 'fixed';
        note.style.right = 'auto';
        note.style.bottom = 'auto';
        note.style.margin = '0';
        note.style.zIndex = '1000';
    }

    function onMouseUp() {
        if (!isDragging) return;

        isDragging = false;
        note.classList.remove('dragging');
        draggedNote = null;
        saveNotes();

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}

function deleteNote(id) {
    const note = document.querySelector(`[data-id="${id}"]`);
    if (note) {
        note.style.animation = 'none';
        note.style.transform = 'scale(0)';
        setTimeout(() => {
            note.remove();
            updateNoteCount();
            saveNotes();
        }, 300);
    }
}

function changeNoteColor(event) {
    event.stopPropagation();
    const note = event.target.closest('.note');
    const color = document.getElementById('colorPicker').value;
    note.style.background = color;
    saveNotes();
}

function clearAllNotes() {
    if (confirm('Delete all notes? This cannot be undone.')) {
        document.querySelectorAll('.note').forEach(note => note.remove());
        updateNoteCount();
        noteId = 0;
        saveNotes();
    }
}

function updateNoteCount() {
    const count = document.querySelectorAll('.note').length;
    document.getElementById('noteCount').textContent = count;
}

function getSavedNotes() {
    const saved = localStorage.getItem('stickyNotes');
    return saved ? JSON.parse(saved) : [];
}

function saveNotes() {
    const notes = Array.from(document.querySelectorAll('.note')).map(note => ({
        id: Number(note.dataset.id),
        content: note.querySelector('textarea').value,
        color: note.style.background,
        x: note.style.left,
        y: note.style.top
    }));
    localStorage.setItem('stickyNotes', JSON.stringify(notes));
}

function restoreNotes() {
    const savedNotes = getSavedNotes();
    if (savedNotes.length === 0) {
        addNote('🚀 Welcome to Sticky Notes!\n\n• Drag notes anywhere\n• Change colors with picker\n• Right-click for quick color\n• Double-click to edit', '#a8e6cf');
        addNote('💡 Ideas:\n• Add local storage\n• Export notes\n• Note categories', '#ffd93d');
        addNote('📝 Quick tip:\nHit the + button to add new notes!', '#ff6b9d');
        return;
    }

    noteId = savedNotes.reduce((max, note) => Math.max(max, note.id), -1) + 1;

    savedNotes.forEach(noteData => {
        addNote(noteData.content, noteData.color, noteData.id);
        const note = document.querySelector(`[data-id="${noteData.id}"]`);
        if (noteData.x && noteData.y) {
            note.style.position = 'fixed';
            note.style.left = noteData.x;
            note.style.top = noteData.y;
        }
    });
}

// Right-click to change color
document.addEventListener('contextmenu', (e) => {
    const note = e.target.closest('.note');
    if (note) {
        e.preventDefault();
        const color = document.getElementById('colorPicker').value;
        note.style.background = color;
        saveNotes();
    }
});

// Double-click note to focus textarea
document.addEventListener('dblclick', (e) => {
    const textarea = e.target.closest('.note')?.querySelector('textarea');
    if (textarea) {
        textarea.focus();
    }
});

window.addEventListener('DOMContentLoaded', restoreNotes);
window.addEventListener('beforeunload', saveNotes);

   