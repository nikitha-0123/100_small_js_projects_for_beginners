// Quiz Configuration
const QUESTIONS_PER_QUIZ = 10;
const TIME_PER_QUESTION = 30; // seconds

// Quiz Data (Sample questions - can be replaced with API calls)
const quizData = {
    general: {
        easy: [
            {
                question: "What is the capital of France?",
                options: ["London", "Berlin", "Paris", "Madrid"],
                correct: 2
            },
            // Add more questions...
        ],
        medium: [
            {
                question: "Which element has the chemical symbol 'Au'?",
                options: ["Silver", "Gold", "Copper", "Aluminum"],
                correct: 1
            },
            // Add more questions...
        ],
        hard: [
            {
                question: "In which year was the first iPhone released?",
                options: ["2005", "2006", "2007", "2008"],
                correct: 2
            },
            // Add more questions...
        ]
    },
    // Add more categories...
};

// DOM Elements
const welcomeScreen = document.getElementById('welcomeScreen');
const quizScreen = document.getElementById('quizScreen');
const resultsScreen = document.getElementById('resultsScreen');
const categoryBtns = document.querySelectorAll('.category-btn');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const startBtn = document.getElementById('startQuiz');
const questionElement = document.getElementById('question');
const optionsContainer = document.getElementById('options');
const nextBtn = document.getElementById('nextBtn');
const currentQuestionSpan = document.getElementById('currentQuestion');
const totalQuestionsSpan = document.getElementById('totalQuestions');
const timeLeftSpan = document.getElementById('timeLeft');
const currentScoreSpan = document.getElementById('currentScore');
const progressBar = document.querySelector('.progress');
const finalScoreSpan = document.getElementById('finalScore');
const correctAnswersSpan = document.getElementById('correctAnswers');
const timeTakenSpan = document.getElementById('timeTaken');
const accuracySpan = document.getElementById('accuracy');
const reviewContainer = document.getElementById('reviewContainer');
const restartBtn = document.getElementById('restartQuiz');
const shareBtn = document.getElementById('shareResults');

// Quiz State
let selectedCategory = '';
let selectedDifficulty = '';
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft;
let startTime;
let userAnswers = [];

// Event Listeners
categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedCategory = btn.dataset.category;
        checkStartConditions();
    });
});

difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        difficultyBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedDifficulty = btn.dataset.difficulty;
        checkStartConditions();
    });
});

startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', resetQuiz);
shareBtn.addEventListener('click', shareResults);

// Quiz Functions
function checkStartConditions() {
    startBtn.disabled = !(selectedCategory && selectedDifficulty);
}

function startQuiz() {
    // Initialize quiz state
    currentQuestions = getRandomQuestions();
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    startTime = new Date();
    
    // Update UI
    welcomeScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    resultsScreen.classList.add('hidden');
    
    totalQuestionsSpan.textContent = QUESTIONS_PER_QUIZ;
    updateScore();
    showQuestion();
}

function getRandomQuestions() {
    const questions = quizData[selectedCategory][selectedDifficulty];
    return shuffleArray(questions).slice(0, QUESTIONS_PER_QUIZ);
}

function showQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    currentQuestionSpan.textContent = currentQuestionIndex + 1;
    questionElement.textContent = question.question;
    
    // Create options
    optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = option;
        optionElement.addEventListener('click', () => selectOption(index));
        optionsContainer.appendChild(optionElement);
    });
    
    // Update progress
    const progress = ((currentQuestionIndex + 1) / QUESTIONS_PER_QUIZ) * 100;
    progressBar.style.width = `${progress}%`;
    
    // Reset and start timer
    resetTimer();
    startTimer();
    
    // Reset next button
    nextBtn.disabled = true;
}

function selectOption(index) {
    const options = optionsContainer.children;
    const currentQuestion = currentQuestions[currentQuestionIndex];
    
    // Clear previous selection
    Array.from(options).forEach(option => {
        option.classList.remove('selected', 'correct', 'wrong');
    });
    
    // Show selected option
    options[index].classList.add('selected');
    
    // Show correct/wrong indication
    if (index === currentQuestion.correct) {
        options[index].classList.add('correct');
        score += calculateScore();
        updateScore();
    } else {
        options[index].classList.add('wrong');
        options[currentQuestion.correct].classList.add('correct');
    }
    
    // Save user's answer
    userAnswers.push({
        question: currentQuestion.question,
        userAnswer: currentQuestion.options[index],
        correctAnswer: currentQuestion.options[currentQuestion.correct],
        isCorrect: index === currentQuestion.correct
    });
    
    // Enable next button
    nextBtn.disabled = false;
    
    // Stop timer
    clearInterval(timer);
}

function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < QUESTIONS_PER_QUIZ) {
        showQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    quizScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');
    
    const endTime = new Date();
    const timeTaken = Math.floor((endTime - startTime) / 1000);
    const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
    const accuracy = (correctAnswers / QUESTIONS_PER_QUIZ) * 100;
    
    finalScoreSpan.textContent = score;
    correctAnswersSpan.textContent = `${correctAnswers}/${QUESTIONS_PER_QUIZ}`;
    timeTakenSpan.textContent = formatTime(timeTaken);
    accuracySpan.textContent = `${Math.round(accuracy)}%`;
    
    // Show answer review
    showAnswerReview();
}

function showAnswerReview() {
    reviewContainer.innerHTML = '';
    
    userAnswers.forEach((answer, index) => {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        reviewItem.innerHTML = `
            <div class="question-text">${index + 1}. ${answer.question}</div>
            <div class="user-answer">
                Your Answer: ${answer.userAnswer}
                ${answer.isCorrect ? '✓' : '✗'}
            </div>
            ${!answer.isCorrect ? `
                <div class="correct-answer">
                    Correct Answer: ${answer.correctAnswer}
                </div>
            ` : ''}
        `;
        reviewContainer.appendChild(reviewItem);
    });
}

function resetQuiz() {
    selectedCategory = '';
    selectedDifficulty = '';
    categoryBtns.forEach(btn => btn.classList.remove('selected'));
    difficultyBtns.forEach(btn => btn.classList.remove('selected'));
    startBtn.disabled = true;
    
    resultsScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
}

function shareResults() {
    const text = `
        I just completed a quiz!
        Score: ${score}
        Correct Answers: ${correctAnswersSpan.textContent}
        Accuracy: ${accuracySpan.textContent}
        Time Taken: ${timeTakenSpan.textContent}
    `.trim();
    
    if (navigator.share) {
        navigator.share({
            title: 'My Quiz Results',
            text: text
        }).catch(console.error);
    } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(text)
            .then(() => alert('Results copied to clipboard!'))
            .catch(console.error);
    }
}

// Timer Functions
function startTimer() {
    timeLeft = TIME_PER_QUESTION;
    updateTimer();
    
    timer = setInterval(() => {
        timeLeft--;
        updateTimer();
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            // Auto-select wrong answer if time runs out
            const currentQuestion = currentQuestions[currentQuestionIndex];
            const wrongIndex = (currentQuestion.correct + 1) % currentQuestion.options.length;
            selectOption(wrongIndex);
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timer);
    timeLeft = TIME_PER_QUESTION;
    updateTimer();
}

function updateTimer() {
    timeLeftSpan.textContent = timeLeft;
}

function updateScore() {
    currentScoreSpan.textContent = score;
}

function calculateScore() {
    // Score based on time left (faster answer = more points)
    const basePoints = 100;
    const timeBonus = Math.floor((timeLeft / TIME_PER_QUESTION) * 50);
    return basePoints + timeBonus;
}

// Utility Functions
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 