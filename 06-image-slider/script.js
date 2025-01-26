// DOM Elements
const slider = document.querySelector('.slider');
const slides = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
const dotsContainer = document.querySelector('.dots-container');
const autoplayBtn = document.querySelector('.autoplay');
const progressBar = document.querySelector('.progress');

// Variables
let currentSlide = 0;
let autoplayInterval;
let isPlaying = false;
const autoplayDuration = 5000; // 5 seconds
let progressWidth = 0;
let progressInterval;

// Create dots
slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.className = `dot ${index === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
});

// Functions
function updateSlides() {
    // Update slides
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
    });
    
    // Update dots
    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
    
    // Reset progress
    resetProgress();
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlides();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlides();
}

function goToSlide(index) {
    currentSlide = index;
    updateSlides();
}

function toggleAutoplay() {
    isPlaying = !isPlaying;
    autoplayBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    
    if (isPlaying) {
        startAutoplay();
    } else {
        stopAutoplay();
    }
}

function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, autoplayDuration);
    startProgress();
}

function stopAutoplay() {
    clearInterval(autoplayInterval);
    clearInterval(progressInterval);
    progressWidth = 0;
    progressBar.style.width = '0%';
}

function resetProgress() {
    if (isPlaying) {
        stopAutoplay();
        startAutoplay();
    }
}

function startProgress() {
    progressWidth = 0;
    const step = 100 / (autoplayDuration / 10); // Update every 10ms
    
    progressInterval = setInterval(() => {
        progressWidth = Math.min(progressWidth + step, 100);
        progressBar.style.width = `${progressWidth}%`;
    }, 10);
}

// Touch support
let touchStartX = 0;
let touchEndX = 0;

slider.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

slider.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            nextSlide();
        } else {
            prevSlide();
        }
    }
}

// Event Listeners
prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);
autoplayBtn.addEventListener('click', toggleAutoplay);

// Keyboard navigation
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') {
        prevSlide();
    } else if (e.key === 'ArrowRight') {
        nextSlide();
    } else if (e.key === 'Space') {
        e.preventDefault();
        toggleAutoplay();
    }
});

// Pause autoplay when tab is not visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden && isPlaying) {
        stopAutoplay();
        isPlaying = true; // Keep the state but pause the timer
    } else if (!document.hidden && isPlaying) {
        startAutoplay();
    }
});

// Stop autoplay when user interacts with slider
slider.addEventListener('mouseenter', () => {
    if (isPlaying) {
        stopAutoplay();
    }
});

slider.addEventListener('mouseleave', () => {
    if (isPlaying) {
        startAutoplay();
    }
}); 