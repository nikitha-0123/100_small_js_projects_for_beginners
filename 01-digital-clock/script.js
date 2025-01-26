function updateClock() {
    const now = new Date();
    
    // Update time
    const time = document.getElementById('time');
    time.textContent = now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    // Update date
    const date = document.getElementById('date');
    date.textContent = now.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Update clock immediately and then every second
updateClock();
setInterval(updateClock, 1000); 