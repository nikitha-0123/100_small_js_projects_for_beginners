// DOM Elements
const value = document.getElementById('value');
const stepValue = document.getElementById('step-value');
const stepInput = document.getElementById('step-input');
const maxInput = document.getElementById('max-input');
const minInput = document.getElementById('min-input');
const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');
const savedList = document.querySelector('.saved-list');

// State
let count = 0;
let step = 1;
let max = 999999;
let min = -999999;
let savedValues = JSON.parse(localStorage.getItem('savedValues')) || [];

// Update display with animation
function updateDisplay(newValue) {
    // Add animation class
    value.style.transform = 'scale(1.2)';
    value.style.color = newValue > count ? '#27ae60' : newValue < count ? '#e74c3c' : '#764ba2';
    
    // Update value
    count = newValue;
    value.textContent = count;
    
    // Remove animation
    setTimeout(() => {
        value.style.transform = 'scale(1)';
        value.style.color = '#764ba2';
    }, 200);
}

// Update step size display
function updateStepDisplay() {
    stepValue.textContent = step;
}

// Validate value within bounds
function validateValue(newValue) {
    return Math.min(Math.max(newValue, min), max);
}

// Event Listeners for counter controls
document.querySelector('.increase').addEventListener('click', () => {
    updateDisplay(validateValue(count + step));
});

document.querySelector('.decrease').addEventListener('click', () => {
    updateDisplay(validateValue(count - step));
});

document.querySelector('.reset').addEventListener('click', () => {
    updateDisplay(0);
});

// Settings event listeners
stepInput.addEventListener('change', () => {
    step = Math.max(1, parseInt(stepInput.value) || 1);
    updateStepDisplay();
});

maxInput.addEventListener('change', () => {
    max = parseInt(maxInput.value);
    if (count > max) updateDisplay(max);
});

minInput.addEventListener('change', () => {
    min = parseInt(minInput.value);
    if (count < min) updateDisplay(min);
});

// Save and load functionality
function saveValue() {
    const timestamp = new Date().toLocaleString();
    const savedValue = {
        value: count,
        timestamp,
        id: Date.now()
    };
    savedValues.unshift(savedValue);
    
    // Keep only last 10 values
    if (savedValues.length > 10) {
        savedValues.pop();
    }
    
    localStorage.setItem('savedValues', JSON.stringify(savedValues));
    updateSavedList();
}

function updateSavedList() {
    savedList.innerHTML = '';
    savedValues.forEach(saved => {
        const item = document.createElement('div');
        item.className = 'saved-item';
        item.innerHTML = `
            <span>${saved.value}</span>
            <small>${saved.timestamp}</small>
            <i class="fas fa-times delete-saved"></i>
        `;
        
        // Load value on click
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-saved')) {
                updateDisplay(saved.value);
            }
        });
        
        // Delete saved value
        item.querySelector('.delete-saved').addEventListener('click', (e) => {
            e.stopPropagation();
            savedValues = savedValues.filter(v => v.id !== saved.id);
            localStorage.setItem('savedValues', JSON.stringify(savedValues));
            updateSavedList();
        });
        
        savedList.appendChild(item);
    });
}

// Save and Load buttons
saveBtn.addEventListener('click', saveValue);

loadBtn.addEventListener('click', () => {
    if (savedValues.length > 0) {
        updateDisplay(savedValues[0].value);
    }
});

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        updateDisplay(validateValue(count + step));
    } else if (e.key === 'ArrowDown') {
        updateDisplay(validateValue(count - step));
    } else if (e.key === 'r') {
        updateDisplay(0);
    } else if (e.key === 's') {
        saveValue();
    }
});

// Initial render
updateSavedList(); 