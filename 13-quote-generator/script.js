const quoteText = document.getElementById('quote-text');
const authorText = document.getElementById('author');
const newQuoteBtn = document.getElementById('new-quote');
const tweetQuoteBtn = document.getElementById('tweet-quote');
const container = document.querySelector('.container');

// API URL for quotes
const QUOTE_API = 'https://api.quotable.io/random';

// Function to show loading state
function showLoadingState() {
    container.classList.add('loading');
    quoteText.style.opacity = '0.5';
    authorText.style.opacity = '0.5';
}

// Function to hide loading state
function hideLoadingState() {
    container.classList.remove('loading');
    quoteText.style.opacity = '1';
    authorText.style.opacity = '1';
}

// Function to fetch new quote
async function getQuote() {
    showLoadingState();
    
    try {
        const response = await fetch(QUOTE_API);
        const data = await response.json();
        
        // Add fade out effect
        quoteText.style.opacity = '0';
        authorText.style.opacity = '0';
        
        setTimeout(() => {
            quoteText.textContent = data.content;
            authorText.textContent = `- ${data.author}`;
            
            // Add fade in effect
            quoteText.style.opacity = '1';
            authorText.style.opacity = '1';
        }, 500);
        
    } catch (error) {
        quoteText.textContent = 'Oops! Something went wrong. Please try again later.';
        authorText.textContent = '- Error';
        console.error('Error fetching quote:', error);
    }
    
    hideLoadingState();
}

// Function to tweet the quote
function tweetQuote() {
    const quote = quoteText.textContent;
    const author = authorText.textContent;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${quote}" ${author}`)}`;
    window.open(twitterUrl, '_blank');
}

// Event listeners
newQuoteBtn.addEventListener('click', getQuote);
tweetQuoteBtn.addEventListener('click', tweetQuote);

// Add hover effect to buttons
const buttons = document.querySelectorAll('.btn');
buttons.forEach(button => {
    button.addEventListener('mouseover', () => {
        button.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseout', () => {
        button.style.transform = 'translateY(0)';
    });
});

// Get initial quote
getQuote(); 