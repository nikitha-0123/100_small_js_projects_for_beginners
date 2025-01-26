// Get DOM elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const tasksLeft = document.getElementById('tasks-left');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterBtns = document.querySelectorAll('.filter-btn');

// Initialize todos array from localStorage or empty array
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// Save todos to localStorage
const saveTodos = () => {
    localStorage.setItem('todos', JSON.stringify(todos));
    updateTasksLeft();
};

// Create todo item element
const createTodoElement = (todo) => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.innerHTML = `
        <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
        <span class="todo-text">${todo.text}</span>
        <button class="delete-btn">
            <i class="fas fa-trash"></i>
        </button>
    `;

    // Add event listeners
    const checkbox = li.querySelector('.todo-checkbox');
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    return li;
};

// Add new todo
const addTodo = (text) => {
    const todo = {
        id: Date.now(),
        text,
        completed: false
    };
    todos.push(todo);
    saveTodos();
    renderTodos();
};

// Toggle todo completion
const toggleTodo = (id) => {
    todos = todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodos();
};

// Delete todo
const deleteTodo = (id) => {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
};

// Clear completed todos
const clearCompleted = () => {
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
};

// Update tasks left count
const updateTasksLeft = () => {
    const activeTodos = todos.filter(todo => !todo.completed);
    tasksLeft.textContent = `${activeTodos.length} task${activeTodos.length === 1 ? '' : 's'} left`;
};

// Filter todos
const filterTodos = (filter) => {
    currentFilter = filter;
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderTodos();
};

// Render todos
const renderTodos = () => {
    todoList.innerHTML = '';
    let filteredTodos = todos;

    if (currentFilter === 'active') {
        filteredTodos = todos.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    }

    filteredTodos.forEach(todo => {
        todoList.appendChild(createTodoElement(todo));
    });
};

// Event listeners
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (text) {
        addTodo(text);
        todoInput.value = '';
    }
});

clearCompletedBtn.addEventListener('click', clearCompleted);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => filterTodos(btn.dataset.filter));
});

// Initial render
renderTodos(); 