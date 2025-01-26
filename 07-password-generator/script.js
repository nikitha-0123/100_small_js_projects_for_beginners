// DOM Elements
const passwordDisplay = document.getElementById('password');
const lengthSlider = document.getElementById('length');
const lengthValue = document.getElementById('length-value');
const uppercaseCheck = document.getElementById('uppercase');
const lowercaseCheck = document.getElementById('lowercase');
const numbersCheck = document.getElementById('numbers');
const symbolsCheck = document.getElementById('symbols');
const excludeSimilarCheck = document.getElementById('exclude-similar');
const excludeAmbiguousCheck = document.getElementById('exclude-ambiguous');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const strengthBar = document.querySelector('.strength-bar');
const strengthText = document.querySelector('.strength-text');
const historyList = document.querySelector('.history-list');

// Character Sets
const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';   
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const SIMILAR_CHARS = 'il1Lo0O';
const AMBIGUOUS_CHARS = '{}[]()\/\'"`~,;:.<>';

// Password History
let passwordHistory = JSON.parse(localStorage.getItem('passwordHistory')) || [];
const MAX_HISTORY = 50;

// Update length display
lengthSlider.addEventListener('input', () => {
    lengthValue.textContent = lengthSlider.value;
});

// Generate password
function generatePassword() {
    let chars = '';
    let password = '';

    // Build character set based on options
    if (uppercaseCheck.checked) chars += UPPERCASE_CHARS;
    if (lowercaseCheck.checked) chars += LOWERCASE_CHARS;
    if (numbersCheck.checked) chars += NUMBER_CHARS;
    if (symbolsCheck.checked) chars += SYMBOL_CHARS;

    // Remove excluded characters
    if (excludeSimilarCheck.checked) {
        SIMILAR_CHARS.split('').forEach(char => {
            chars = chars.replace(new RegExp(char, 'g'), '');
        });
    }
    if (excludeAmbiguousCheck.checked) {
        AMBIGUOUS_CHARS.split('').forEach(char => {
            chars = chars.replace(new RegExp('\\' + char, 'g'), '');
        });
    }

    // Validate options
    if (!chars) {
        alert('Please select at least one character type');
        return;
    }

    // Ensure at least one character from each selected type
    if (uppercaseCheck.checked) 
        password += UPPERCASE_CHARS[Math.floor(Math.random() * UPPERCASE_CHARS.length)];
    if (lowercaseCheck.checked)
        password += LOWERCASE_CHARS[Math.floor(Math.random() * LOWERCASE_CHARS.length)];
    if (numbersCheck.checked)
        password += NUMBER_CHARS[Math.floor(Math.random() * NUMBER_CHARS.length)];
    if (symbolsCheck.checked)
        password += SYMBOL_CHARS[Math.floor(Math.random() * SYMBOL_CHARS.length)];

    // Fill remaining length with random characters
    while (password.length < lengthSlider.value) {
        const randomChar = chars[Math.floor(Math.random() * chars.length)];
        password += randomChar;
    }

    // Shuffle password
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    // Update display
    passwordDisplay.value = password;
    updateStrengthMeter(password);
    addToHistory(password);
}

// Check password strength
function checkStrength(password) {
    let score = 0;
    
    // Length check
    if (password.length >= 12) score += 2;
    else if (password.length >= 8) score += 1;
    
    // Character type checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // Variety check
    const uniqueChars = new Set(password).size;
    if (uniqueChars >= password.length * 0.7) score += 1;
    
    return score;
}

// Update strength meter
function updateStrengthMeter(password) {
    const score = checkStrength(password);
    
    strengthBar.className = 'strength-bar';
    if (score <= 2) {
        strengthBar.classList.add('weak');
        strengthText.textContent = 'Weak Password';
    } else if (score <= 4) {
        strengthBar.classList.add('medium');
        strengthText.textContent = 'Medium Password';
    } else if (score <= 6) {
        strengthBar.classList.add('strong');
        strengthText.textContent = 'Strong Password';
    } else {
        strengthBar.classList.add('very-strong');
        strengthText.textContent = 'Very Strong Password';
    }
}

// Add password to history
function addToHistory(password) {
    const timestamp = new Date().toLocaleString();
    passwordHistory.unshift({ password, timestamp });
    
    if (passwordHistory.length > MAX_HISTORY) {
        passwordHistory.pop();
    }
    
    localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
    updateHistoryDisplay();
}

// Update history display
function updateHistoryDisplay() {
    historyList.innerHTML = '';
    
    passwordHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <span class="history-password">${item.password}</span>
            <div class="history-actions">
                <button class="history-btn" onclick="copyPassword(${index})" title="Copy">
                    <i class="far fa-copy"></i>
                </button>
                <button class="history-btn" onclick="removeFromHistory(${index})" title="Delete">
                    <i class="far fa-trash-alt"></i>
                </button>
            </div>
        `;
        historyList.appendChild(historyItem);
    });
}

// Copy password to clipboard
function copyPassword(index = -1) {
    const textToCopy = index === -1 ? passwordDisplay.value : passwordHistory[index].password;
    navigator.clipboard.writeText(textToCopy).then(() => {
        showCopyFeedback();
    });
}

// Show copy feedback
function showCopyFeedback() {
    const originalIcon = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
        copyBtn.innerHTML = originalIcon;
    }, 1000);
}

// Remove password from history
function removeFromHistory(index) {
    passwordHistory.splice(index, 1);
    localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
    updateHistoryDisplay();
}

// Event Listeners
generateBtn.addEventListener('click', generatePassword);
copyBtn.addEventListener('click', () => copyPassword());

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        generatePassword();
    } else if (e.ctrlKey && e.key === 'c' && document.activeElement === passwordDisplay) {
        copyPassword();
    }
});

// Initial setup
updateHistoryDisplay();
generatePassword(); 