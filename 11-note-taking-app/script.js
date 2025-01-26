// DOM Elements
const newNoteBtn = document.getElementById('newNoteBtn');
const searchInput = document.getElementById('searchInput');
const categoryList = document.getElementById('categoryList');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const notesList = document.getElementById('notesList');
const settingsBtn = document.getElementById('settingsBtn');
const emptyState = document.getElementById('emptyState');
const noteEditor = document.getElementById('noteEditor');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const categorySelector = document.getElementById('categorySelector');
const categoryDropdown = document.getElementById('categoryDropdown');
const deleteNoteBtn = document.getElementById('deleteNoteBtn');
const addCategoryModal = document.getElementById('addCategoryModal');
const deleteModal = document.getElementById('deleteModal');
const settingsModal = document.getElementById('settingsModal');

// Initialize EasyMDE
const easyMDE = new EasyMDE({
    element: noteContent,
    autofocus: true,
    spellChecker: false,
    status: false,
    toolbar: [
        'bold', 'italic', 'strikethrough', '|',
        'heading', 'quote', 'code', '|',
        'unordered-list', 'ordered-list', 'task-list', '|',
        'link', 'image', 'table'
    ],
    minHeight: '500px'
});

// Remove custom toolbar since we're using EasyMDE's built-in toolbar
const editorToolbar = document.querySelector('.editor-toolbar');
if (editorToolbar) {
    editorToolbar.remove();
}

// State
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || [
    { id: 'all', name: 'All Notes', icon: 'layer-group' },
    { id: 'personal', name: 'Personal', icon: 'user' },
    { id: 'work', name: 'Work', icon: 'briefcase' },
    { id: 'study', name: 'Study', icon: 'graduation-cap' }
];
let currentNote = null;
let currentCategory = 'all';
let settings = JSON.parse(localStorage.getItem('settings')) || {
    theme: 'light',
    fontSize: 'medium',
    autoSave: true,
    spellCheck: true
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    loadSettings();
});

newNoteBtn.addEventListener('click', createNewNote);
searchInput.addEventListener('input', handleSearch);
addCategoryBtn.addEventListener('click', () => showModal(addCategoryModal));
settingsBtn.addEventListener('click', () => showModal(settingsModal));
deleteNoteBtn.addEventListener('click', () => showModal(deleteModal));

// Initialize App
function initializeApp() {
    updateCategoryList();
    updateNotesList();
    loadTheme();
    
    // Add click listeners to category items
    categoryList.addEventListener('click', (e) => {
        const categoryItem = e.target.closest('.category-item');
        if (categoryItem) {
            const categoryId = categoryItem.dataset.category;
            setActiveCategory(categoryId);
            
            // On mobile, close sidebar after category selection
            if (window.innerWidth <= 768) {
                document.querySelector('.sidebar').classList.remove('active');
            }
        }
    });
    
    // Add click listener to empty state new note button
    emptyState.querySelector('.new-note-btn').addEventListener('click', createNewNote);
    
    // Add auto-save functionality
    if (settings.autoSave) {
        easyMDE.codemirror.on('change', () => {
            if (currentNote) {
                saveCurrentNote();
            }
        });
    }
}

// Note Management
function createNewNote() {
    const note = {
        id: Date.now(),
        title: 'Untitled Note',
        content: '',
        category: currentCategory === 'all' ? 'personal' : currentCategory,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    };
    
    notes.unshift(note);
    saveNotes();
    setCurrentNote(note);
    updateNotesList();
}

function setCurrentNote(note) {
    currentNote = note;
    if (note) {
        noteEditor.classList.remove('hidden');
        emptyState.classList.add('hidden');
        noteTitle.value = note.title;
        easyMDE.value(note.content);
        updateCategorySelector(note.category);
        
        // Focus title when creating new note
        if (note.title === 'Untitled Note') {
            noteTitle.focus();
            noteTitle.select();
        }
    } else {
        noteEditor.classList.add('hidden');
        emptyState.classList.remove('hidden');
    }
}

function saveCurrentNote() {
    if (!currentNote) return;
    
    const oldTitle = currentNote.title;
    currentNote.title = noteTitle.value || 'Untitled Note';
    currentNote.content = easyMDE.value();
    currentNote.updated = new Date().toISOString();
    
    // Move note to top if title changed
    if (oldTitle !== currentNote.title) {
        const index = notes.findIndex(note => note.id === currentNote.id);
        if (index !== -1) {
            notes.splice(index, 1);
            notes.unshift(currentNote);
        }
    }
    
    saveNotes();
    updateNotesList();
}

function deleteCurrentNote() {
    if (!currentNote) return;
    
    const index = notes.findIndex(note => note.id === currentNote.id);
    if (index !== -1) {
        notes.splice(index, 1);
        saveNotes();
        setCurrentNote(null);
        updateNotesList();
    }
    
    hideModal(deleteModal);
}

// Category Management
function setActiveCategory(categoryId) {
    currentCategory = categoryId;
    
    // Update UI
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.toggle('active', item.dataset.category === categoryId);
    });
    
    updateNotesList();
}

function addCategory(name, icon) {
    // Check for duplicate names
    const normalizedName = name.trim();
    const exists = categories.some(cat => 
        cat.name.toLowerCase() === normalizedName.toLowerCase()
    );
    
    if (exists) {
        alert('A category with this name already exists');
        return;
    }
    
    const category = {
        id: normalizedName.toLowerCase().replace(/\s+/g, '-'),
        name: normalizedName,
        icon: icon
    };
    
    categories.push(category);
    saveCategories();
    updateCategoryList();
    hideModal(addCategoryModal);
    
    // Clear input
    document.getElementById('categoryName').value = '';
    
    // Select the new category
    setActiveCategory(category.id);
}

function updateCategoryList() {
    categoryList.innerHTML = categories.map(category => `
        <button class="category-item ${category.id === currentCategory ? 'active' : ''}" 
                data-category="${category.id}">
            <i class="fas fa-${category.icon}"></i>
            <span>${category.name}</span>
            <span class="note-count">${countNotesByCategory(category.id)}</span>
        </button>
    `).join('');
    
    updateCategoryDropdown();
}

function updateCategoryDropdown() {
    const dropdownContent = categories
        .filter(category => category.id !== 'all')
        .map(category => `
            <button class="category-item" data-category="${category.id}">
                <i class="fas fa-${category.icon}"></i>
                <span>${category.name}</span>
            </button>
        `).join('');
    
    categoryDropdown.innerHTML = dropdownContent;
}

function updateCategorySelector(categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
        categorySelector.innerHTML = `
            <i class="fas fa-${category.icon}"></i>
            <span>${category.name}</span>
            <i class="fas fa-chevron-down"></i>
        `;
        
        // Update dropdown
        categoryDropdown.innerHTML = categories
            .filter(cat => cat.id !== 'all')
            .map(cat => `
                <button class="category-item ${cat.id === categoryId ? 'active' : ''}" 
                        data-category="${cat.id}">
                    <i class="fas fa-${cat.icon}"></i>
                    <span>${cat.name}</span>
                </button>
            `).join('');
    }
}

// Notes List Management
function updateNotesList() {
    const filteredNotes = filterNotes();
    
    if (filteredNotes.length === 0) {
        notesList.innerHTML = `
            <div class="empty-notes">
                <p>No notes found</p>
            </div>
        `;
        return;
    }
    
    notesList.innerHTML = filteredNotes.map(note => `
        <div class="note-item ${note.id === currentNote?.id ? 'active' : ''}"
             data-note-id="${note.id}">
            <div class="note-title">${note.title}</div>
            <div class="note-excerpt">${getExcerpt(note.content)}</div>
            <div class="note-meta">
                <span>${formatDate(note.updated)}</span>
                <span>${getCategoryName(note.category)}</span>
            </div>
        </div>
    `).join('');
    
    // Add click listeners to note items
    notesList.querySelectorAll('.note-item').forEach(item => {
        item.addEventListener('click', () => {
            const note = notes.find(n => n.id === parseInt(item.dataset.noteId));
            if (note) {
                setCurrentNote(note);
            }
        });
    });
}

function filterNotes() {
    let filtered = notes;
    
    // Filter by category
    if (currentCategory !== 'all') {
        filtered = filtered.filter(note => note.category === currentCategory);
    }
    
    // Filter by search
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(note =>
            note.title.toLowerCase().includes(searchTerm) ||
            note.content.toLowerCase().includes(searchTerm)
        );
    }
    
    return filtered;
}

// Settings Management
function loadSettings() {
    // Theme
    document.getElementById('themeSelect').value = settings.theme;
    document.getElementById('fontSizeSelect').value = settings.fontSize;
    document.getElementById('autoSaveToggle').checked = settings.autoSave;
    document.getElementById('spellCheckToggle').checked = settings.spellCheck;
    
    // Apply settings
    loadTheme();
    applyFontSize();
    easyMDE.codemirror.setOption('spellcheck', settings.spellCheck);
}

function saveSettings() {
    settings = {
        theme: document.getElementById('themeSelect').value,
        fontSize: document.getElementById('fontSizeSelect').value,
        autoSave: document.getElementById('autoSaveToggle').checked,
        spellCheck: document.getElementById('spellCheckToggle').checked
    };
    
    localStorage.setItem('settings', JSON.stringify(settings));
    loadTheme();
    applyFontSize();
    easyMDE.codemirror.setOption('spellcheck', settings.spellCheck);
    
    hideModal(settingsModal);
}

function loadTheme() {
    if (settings.theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
        document.body.setAttribute('data-theme', settings.theme);
    }
}

function applyFontSize() {
    const sizes = {
        small: '14px',
        medium: '16px',
        large: '18px'
    };
    document.documentElement.style.setProperty('--editor-font-size', sizes[settings.fontSize]);
}

// Utility Functions
function showModal(modal) {
    modal.classList.remove('hidden');
    
    // Focus input if it exists
    const input = modal.querySelector('input[type="text"]');
    if (input) {
        setTimeout(() => input.focus(), 100);
    }
}

function hideModal(modal) {
    modal.classList.add('hidden');
    
    // Clear inputs
    modal.querySelectorAll('input[type="text"]').forEach(input => {
        input.value = '';
    });
}

function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(categories));
}

function countNotesByCategory(categoryId) {
    if (categoryId === 'all') return notes.length;
    return notes.filter(note => note.category === categoryId).length;
}

function getCategoryName(categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : '';
}

function getExcerpt(content, length = 100) {
    return content.length > length
        ? content.substring(0, length).trim() + '...'
        : content;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // If less than 24 hours, show relative time
    if (diff < 24 * 60 * 60 * 1000) {
        if (diff < 60 * 1000) return 'Just now';
        if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m ago`;
        return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
    }
    
    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show full date
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Modal Event Listeners
document.getElementById('confirmAddCategory').addEventListener('click', () => {
    const name = document.getElementById('categoryName').value.trim();
    const icon = document.querySelector('#iconSelector .selected i').classList[1].replace('fa-', '');
    if (name) {
        addCategory(name, icon);
        document.getElementById('categoryName').value = '';
    }
});

document.getElementById('confirmDelete').addEventListener('click', deleteCurrentNote);

document.getElementById('closeSettings').addEventListener('click', saveSettings);

// Close modals when clicking outside
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal(modal);
        }
    });
});

// Icon selector functionality
document.getElementById('iconSelector').addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (button) {
        document.querySelectorAll('#iconSelector button').forEach(btn => {
            btn.classList.remove('selected');
        });
        button.classList.add('selected');
    }
});

// Category dropdown functionality
categorySelector.addEventListener('click', () => {
    categoryDropdown.classList.toggle('hidden');
});

categoryDropdown.addEventListener('click', (e) => {
    const item = e.target.closest('.category-item');
    if (item) {
        const categoryId = item.dataset.category;
        currentNote.category = categoryId;
        saveCurrentNote();
        updateCategorySelector(categoryId);
        categoryDropdown.classList.add('hidden');
    }
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.category-selector')) {
        categoryDropdown.classList.add('hidden');
    }
});

// Auto-save on title change
noteTitle.addEventListener('input', () => {
    if (settings.autoSave && currentNote) {
        saveCurrentNote();
    }
});

// System theme change detection
if (settings.theme === 'system') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', loadTheme);
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + N: New Note
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createNewNote();
    }
    
    // Ctrl/Cmd + S: Manual Save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (currentNote) saveCurrentNote();
    }
    
    // Ctrl/Cmd + F: Focus Search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInput.focus();
    }
    
    // Ctrl/Cmd + Delete: Delete Note
    if ((e.ctrlKey || e.metaKey) && e.key === 'Delete' && currentNote) {
        e.preventDefault();
        showModal(deleteModal);
    }
    
    // Escape: Close any open modal or dropdown
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(hideModal);
        categoryDropdown.classList.add('hidden');
    }
});

// Add keyboard shortcut hints to buttons
newNoteBtn.setAttribute('title', 'New Note (Ctrl+N)');
searchInput.setAttribute('title', 'Search Notes (Ctrl+F)');
deleteNoteBtn.setAttribute('title', 'Delete Note (Ctrl+Delete)');

// Export functionality
function exportNote(format = 'markdown') {
    if (!currentNote) return;
    
    let content = '';
    const metadata = `Title: ${currentNote.title}\nCategory: ${getCategoryName(currentNote.category)}\nCreated: ${new Date(currentNote.created).toLocaleString()}\nLast Updated: ${new Date(currentNote.updated).toLocaleString()}\n\n`;
    
    if (format === 'markdown') {
        content = `# ${currentNote.title}\n\n${metadata}${currentNote.content}`;
        downloadFile(`${currentNote.title}.md`, content);
    } else if (format === 'html') {
        content = `<h1>${currentNote.title}</h1>\n<pre>${metadata}</pre>\n${easyMDE.markdown(currentNote.content)}`;
        downloadFile(`${currentNote.title}.html`, content);
    }
}

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Update editor actions HTML
const editorActions = document.querySelector('.editor-actions');
editorActions.insertAdjacentHTML('afterbegin', `
    <div class="export-dropdown">
        <button id="exportBtn" class="export-btn">
            <i class="fas fa-download"></i>
            <span>Export</span>
            <i class="fas fa-chevron-down"></i>
        </button>
        <div class="export-options hidden">
            <button onclick="exportNote('markdown')">
                <i class="fas fa-file-alt"></i>
                Markdown
            </button>
            <button onclick="exportNote('html')">
                <i class="fas fa-file-code"></i>
                HTML
            </button>
        </div>
    </div>
`);

// Add export dropdown functionality
const exportBtn = document.getElementById('exportBtn');
const exportOptions = document.querySelector('.export-options');

exportBtn.addEventListener('click', () => {
    exportOptions.classList.toggle('hidden');
});

// Close export dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.export-dropdown')) {
        exportOptions.classList.add('hidden');
    }
});

// Import functionality
function importNote(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        let title = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        
        // Create new note
        const note = {
            id: Date.now(),
            title: title,
            content: content,
            category: currentCategory === 'all' ? 'personal' : currentCategory,
            created: new Date().toISOString(),
            updated: new Date().toISOString()
        };
        
        notes.unshift(note);
        saveNotes();
        setCurrentNote(note);
        updateNotesList();
    };
    reader.readAsText(file);
}

// Add import button to sidebar header
const sidebarHeader = document.querySelector('.sidebar-header');
sidebarHeader.insertAdjacentHTML('beforeend', `
    <div class="import-container">
        <input type="file" id="importInput" accept=".txt,.md" class="hidden">
        <button id="importBtn" class="import-btn" title="Import Note">
            <i class="fas fa-file-import"></i>
        </button>
    </div>
`);

// Add import button styles dynamically
const style = document.createElement('style');
style.textContent = `
    .sidebar-header {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 10px;
        align-items: start;
    }
    
    .import-container {
        display: flex;
        justify-content: flex-end;
    }
    
    .import-btn {
        padding: 8px;
        background: transparent;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.3s ease;
    }
    
    .import-btn:hover {
        color: var(--primary-color);
        background: var(--hover-color);
    }
`;
document.head.appendChild(style);

// Add import functionality
const importBtn = document.getElementById('importBtn');
const importInput = document.getElementById('importInput');

importBtn.addEventListener('click', () => {
    importInput.click();
});

importInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        importNote(file);
        importInput.value = ''; // Reset input
    }
});

// Add mobile menu button to header
const mainContent = document.querySelector('.main-content');
mainContent.insertAdjacentHTML('afterbegin', `
    <button id="menuToggle" class="menu-toggle">
        <i class="fas fa-bars"></i>
    </button>
`);

// Add mobile menu styles
document.head.appendChild(Object.assign(document.createElement('style'), {
    textContent: `
        .menu-toggle {
            display: none;
            padding: 10px;
            background: transparent;
            border: none;
            color: var(--text-color);
            cursor: pointer;
            font-size: 1.2rem;
            position: fixed;
            top: 10px;
            left: 10px;
            z-index: 99;
            border-radius: 4px;
        }
        
        .menu-toggle:hover {
            background: var(--hover-color);
        }
        
        @media (max-width: 768px) {
            .menu-toggle {
                display: block;
            }
            
            .main-content {
                padding-top: 60px;
            }
            
            .sidebar {
                position: fixed;
                left: -300px;
                top: 0;
                bottom: 0;
                width: 300px;
                z-index: 100;
                transition: transform 0.3s ease;
                box-shadow: none;
            }
            
            .sidebar.active {
                transform: translateX(300px);
                box-shadow: 2px 0 10px var(--shadow-color);
            }
        }
    `
}));

// Add mobile menu functionality
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.querySelector('.sidebar');

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && 
        !e.target.closest('.sidebar') && 
        !e.target.closest('.menu-toggle') && 
        sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        sidebar.classList.remove('active');
    }
}); 