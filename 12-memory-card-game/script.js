const gameBoard = document.querySelector('.game-board');
const movesDisplay = document.querySelector('.moves');
const timerDisplay = document.querySelector('.timer');
const restartBtn = document.querySelector('.restart-btn');

// Enhanced set of card symbols with more visually appealing emojis
const cardSymbols = [
    '🌟', '🎮', '🎲', '🎯',
    '🎨', '🎭', '🎪', '🎬',
    '🎵', '🎸', '🎹', '🎺'
];
const cards = [...cardSymbols, ...cardSymbols];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timer = 0;
let timerInterval;
let canFlip = true;

// Shuffle cards using Fisher-Yates algorithm
function shuffleCards(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Initialize game board
function initializeGame() {
    const shuffledCards = shuffleCards([...cards]);
    gameBoard.innerHTML = '';
    
    shuffledCards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.cardIndex = index;
        card.dataset.symbol = symbol;
        
        // Create the symbol element that will be shown when flipped
        const symbolElement = document.createElement('span');
        symbolElement.style.display = 'none';
        symbolElement.textContent = symbol;
        card.appendChild(symbolElement);
        
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });

    // Reset game state
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    timer = 0;
    movesDisplay.textContent = `Moves: ${moves}`;
    timerDisplay.textContent = `Time: ${timer}s`;
    clearInterval(timerInterval);
    startTimer();
    canFlip = true;
}

// Start timer
function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        timerDisplay.textContent = `Time: ${timer}s`;
    }, 1000);
}

// Flip card
function flipCard() {
    if (!canFlip || flippedCards.length >= 2 || this.classList.contains('flipped')) return;

    const symbolElement = this.querySelector('span');
    this.classList.add('flipped');
    symbolElement.style.display = 'block';
    flippedCards.push(this);

    if (flippedCards.length === 2) {
        moves++;
        movesDisplay.textContent = `Moves: ${moves}`;
        checkMatch();
    }
}

// Check if flipped cards match
function checkMatch() {
    canFlip = false;
    const [card1, card2] = flippedCards;
    const match = card1.dataset.symbol === card2.dataset.symbol;

    if (match) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        
        if (matchedPairs === cardSymbols.length) {
            setTimeout(() => {
                clearInterval(timerInterval);
                const message = `🎉 Congratulations! 🎉\nYou won in ${moves} moves and ${timer} seconds!`;
                alert(message);
            }, 500);
        }
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.querySelector('span').style.display = 'none';
            card2.querySelector('span').style.display = 'none';
        }, 1000);
    }

    setTimeout(() => {
        flippedCards = [];
        canFlip = true;
    }, 1000);
}

// Event listeners
restartBtn.addEventListener('click', initializeGame);

// Start the game
initializeGame(); 