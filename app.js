let noteId = 0;
        let draggedNote = null;

        function addNote(content = '', color = '#f5f7fa') {
            const note = document.createElement('div');
            note.className = 'note new';
            note.dataset.id = noteId++;
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
            updateNoteCount();
            
            // Make draggable
            makeDraggable(note);
            
            // Auto-focus new textarea
            const textarea = note.querySelector('textarea');
            textarea.focus();
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
                
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
        }

        function deleteNote(id) {
            const note = document.querySelector(`[data-id="${id}"]`);
            if (note) {
                note.style.animation = 'none';
                note.style.transform = 'scale(0)';
                setTimeout(() => note.remove(), 300);
                updateNoteCount();
            }
        }

        function changeNoteColor(event) {
            event.stopPropagation();
            const note = event.target.closest('.note');
            const color = document.getElementById('colorPicker').value;
            note.style.background = color;
        }

        function clearAllNotes() {
            if (confirm('Delete all notes? This cannot be undone.')) {
                document.querySelectorAll('.note').forEach(note => {
                    note.remove();
                });
                updateNoteCount();
                noteId = 0;
            }
        }

        function updateNoteCount() {
            const count = document.querySelectorAll('.note').length;
            document.getElementById('noteCount').textContent = count;
        }

        // Right-click to change color
        document.addEventListener('contextmenu', (e) => {
            const note = e.target.closest('.note');
            if (note) {
                e.preventDefault();
                const color = document.getElementById('colorPicker').value;
                note.style.background = color;
            }
        });

        // Double-click note to focus textarea
        document.addEventListener('dblclick', (e) => {
            const textarea = e.target.closest('.note')?.querySelector('textarea');
            if (textarea) {
                textarea.focus();
            }
        });

        // Initialize with some sample notes
        window.addEventListener('load', () => {
            addNote('🚀 Welcome to Sticky Notes!\n\n• Drag notes anywhere\n• Change colors with picker\n• Right-click for quick color\n• Double-click to edit', '#a8e6cf');
            addNote('💡 Ideas:\n• Add local storage\n• Export notes\n• Note categories', '#ffd93d');
            addNote('📝 Quick tip:\nHit the + button to add new notes!', '#ff6b9d');
        });

        // Save notes to localStorage
        window.addEventListener('beforeunload', () => {
            const notes = Array.from(document.querySelectorAll('.note')).map(note => ({
                id: note.dataset.id,
                content: note.querySelector('textarea').value,
                color: note.style.background,
                x: note.style.left,
                y: note.style.top
            }));
            localStorage.setItem('stickyNotes', JSON.stringify(notes));
        });

        // Load notes from localStorage
        window.addEventListener('DOMContentLoaded', () => {
            const saved = localStorage.getItem('stickyNotes');
            if (saved) {
                JSON.parse(saved).forEach(noteData => {
                    addNote(noteData.content, noteData.color);
                    const note = document.querySelector(`[data-id="${noteData.id}"]`);
                    if (noteData.x && noteData.y) {
                        note.style.position = 'fixed';
                        note.style.left = noteData.x;
                        note.style.top = noteData.y;
                    }
                });
            }
        });
   