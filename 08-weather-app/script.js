// API Configuration
const API_KEY = 'YOUR_API_KEY'; // Replace with your OpenWeatherMap API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const unitToggle = document.getElementById('unit-toggle');
const themeToggle = document.getElementById('theme-toggle');
const weatherInfo = document.querySelector('.weather-info');
const errorMessage = document.querySelector('.error-message');
const loading = document.querySelector('.loading');
const historyList = document.querySelector('.history-list');

// State
let units = localStorage.getItem('units') || 'metric';
let theme = localStorage.getItem('theme') || 'light';
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

// Initialize theme
document.body.setAttribute('data-theme', theme);
themeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

// Weather Data Fetching
async function getWeatherData(query, type = 'city') {
    try {
        showLoading();
        
        let url;
        if (type === 'city') {
            url = `${BASE_URL}/weather?q=${query}&units=${units}&appid=${API_KEY}`;
        } else {
            const [lat, lon] = query.split(',');
            url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('City not found');
        
        const data = await response.json();
        const forecast = await getForecastData(data.coord.lat, data.coord.lon);
        
        updateUI({ current: data, forecast });
        if (type === 'city') addToHistory(query);
        
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

async function getForecastData(lat, lon) {
    const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    // Get one forecast per day
    const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));
    return dailyForecasts.slice(0, 5);
}

// UI Updates
function updateUI(data) {
    const { current, forecast } = data;
    
    // Update current weather
    document.querySelector('.city').textContent = current.name;
    document.querySelector('.country').textContent = current.sys.country;
    document.querySelector('.date').textContent = formatDate(new Date());
    
    const weatherIcon = document.querySelector('.weather-icon');
    weatherIcon.src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;
    weatherIcon.alt = current.weather[0].description;
    
    document.querySelector('.temp').textContent = Math.round(current.main.temp);
    document.querySelector('.unit').textContent = units === 'metric' ? '°C' : '°F';
    document.querySelector('.description').textContent = current.weather[0].description;
    
    document.querySelector('.feels-like').textContent = 
        `${Math.round(current.main.feels_like)}${units === 'metric' ? '°C' : '°F'}`;
    document.querySelector('.humidity').textContent = `${current.main.humidity}%`;
    document.querySelector('.wind-speed').textContent = 
        `${Math.round(current.wind.speed)} ${units === 'metric' ? 'km/h' : 'mph'}`;
    document.querySelector('.wind-direction').textContent = getWindDirection(current.wind.deg);
    
    // Update additional info
    document.querySelector('.sunrise .value').textContent = formatTime(current.sys.sunrise * 1000);
    document.querySelector('.sunset .value').textContent = formatTime(current.sys.sunset * 1000);
    document.querySelector('.pressure .value').textContent = `${current.main.pressure} hPa`;
    document.querySelector('.visibility .value').textContent = 
        `${(current.visibility / 1000).toFixed(1)} km`;
    
    // Update forecast
    updateForecast(forecast);
    
    // Show weather info
    weatherInfo.classList.remove('hidden');
    errorMessage.classList.add('hidden');
}

function updateForecast(forecast) {
    const container = document.querySelector('.forecast-container');
    container.innerHTML = '';
    
    forecast.forEach(day => {
        const date = new Date(day.dt * 1000);
        const temp = Math.round(day.main.temp);
        const icon = day.weather[0].icon;
        const description = day.weather[0].description;
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="forecast-date">${formatDate(date, true)}</div>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}">
            <div class="forecast-temp">${temp}${units === 'metric' ? '°C' : '°F'}</div>
            <div class="forecast-desc">${description}</div>
        `;
        
        container.appendChild(forecastItem);
    });
}

// Utility Functions
function formatDate(date, short = false) {
    const options = short 
        ? { weekday: 'short', month: 'short', day: 'numeric' }
        : { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                       'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

// Search History Management
function addToHistory(city) {
    const normalizedCity = city.toLowerCase();
    searchHistory = searchHistory.filter(item => item.toLowerCase() !== normalizedCity);
    searchHistory.unshift(city);
    if (searchHistory.length > 5) searchHistory.pop();
    
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    updateHistoryUI();
}

function updateHistoryUI() {
    historyList.innerHTML = '';
    searchHistory.forEach(city => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.textContent = city;
        item.addEventListener('click', () => getWeatherData(city));
        historyList.appendChild(item);
    });
}

// UI State Management
function showLoading() {
    loading.classList.remove('hidden');
    weatherInfo.classList.add('hidden');
    errorMessage.classList.add('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(message) {
    errorMessage.querySelector('p').textContent = message;
    errorMessage.classList.remove('hidden');
    weatherInfo.classList.add('hidden');
}

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city) getWeatherData(city);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) getWeatherData(city);
    }
});

locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                getWeatherData(`${latitude},${longitude}`, 'coords');
            },
            error => {
                showError('Unable to retrieve your location');
            }
        );
    } else {
        showError('Geolocation is not supported by your browser');
    }
});

unitToggle.addEventListener('click', () => {
    units = units === 'metric' ? 'imperial' : 'metric';
    localStorage.setItem('units', units);
    
    // Refresh current weather if displayed
    if (!weatherInfo.classList.contains('hidden')) {
        const city = document.querySelector('.city').textContent;
        getWeatherData(city);
    }
});

themeToggle.addEventListener('click', () => {
    theme = theme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// Initial Setup
updateHistoryUI();

// Load last searched city if available
if (searchHistory.length > 0) {
    getWeatherData(searchHistory[0]);
} 