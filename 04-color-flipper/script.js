// DOM Elements
const colorValue = document.querySelector('.color-value');
const changeColorBtn = document.getElementById('btn');
const modeBtns = document.querySelectorAll('.mode-btn');
const historyContainer = document.querySelector('.history-container');

// Color arrays and variables
const simpleColors = [
    'red', 'green', 'blue', 'yellow', 'purple', 'orange',
    'pink', 'cyan', 'brown', 'gray', 'teal', 'indigo'
];

let currentMode = 'simple';
let colorHistory = [];
const maxHistoryItems = 10;

// Generate random color based on mode
function getRandomColor() {
    switch (currentMode) {
        case 'simple':
            return simpleColors[Math.floor(Math.random() * simpleColors.length)];
        
        case 'hex':
            const hex = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += hex[Math.floor(Math.random() * 16)];
            }
            return color;
        
        case 'rgb':
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            return `rgb(${r}, ${g}, ${b})`;
        
        case 'hsl':
            const h = Math.floor(Math.random() * 360);
            const s = Math.floor(Math.random() * 100);
            const l = Math.floor(Math.random() * 100);
            return `hsl(${h}, ${s}%, ${l}%)`;
    }
}

// Update color history
function updateColorHistory(color) {
    colorHistory.unshift(color);
    if (colorHistory.length > maxHistoryItems) {
        colorHistory.pop();
    }
    
    // Update history display
    historyContainer.innerHTML = '';
    colorHistory.forEach(historyColor => {
        const colorBox = document.createElement('div');
        colorBox.className = 'color-box';
        colorBox.style.backgroundColor = historyColor;
        colorBox.title = historyColor;
        
        // Add click event to reuse color
        colorBox.addEventListener('click', () => {
            setColor(historyColor);
        });
        
        historyContainer.appendChild(colorBox);
    });
}

// Set new color
function setColor(color) {
    document.body.style.backgroundColor = color;
    colorValue.textContent = color;
    updateColorHistory(color);
}

// Change color button click handler
changeColorBtn.addEventListener('click', () => {
    const newColor = getRandomColor();
    setColor(newColor);
});

// Mode buttons click handler
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update current mode
        currentMode = btn.dataset.mode;
    });
});

// Copy color value on click
colorValue.addEventListener('click', () => {
    const textArea = document.createElement('textarea');
    textArea.value = colorValue.textContent;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    // Show feedback
    const originalText = colorValue.textContent;
    colorValue.textContent = 'Copied!';
    setTimeout(() => {
        colorValue.textContent = originalText;
    }, 1000);
});

// Initialize with white background
setColor('#FFFFFF'); 