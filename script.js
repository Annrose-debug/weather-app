// ====================================
// 1. GET ALL ELEMENTS FROM HTML
// ====================================
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');

// Display sections
const loadingDiv = document.getElementById('loading');
const weatherDisplay = document.getElementById('weatherDisplay');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

// Weather data elements
const cityName = document.getElementById('cityName');
const currentDate = document.getElementById('currentDate');
const temperature = document.getElementById('temperature');
const weatherIcon = document.getElementById('weatherIcon');
const condition = document.getElementById('condition');
const feelsLike = document.getElementById('feelsLike');
const windSpeed = document.getElementById('windSpeed');
const humidity = document.getElementById('humidity');
const pressure = document.getElementById('pressure');

// ====================================
// 2. API CONFIGURATION
// ====================================
const API_KEY = '4ec347f659266cc1f12950bfec63f775'; 
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// ====================================
// 3. HELPER FUNCTIONS
// ====================================
function showLoading() {
    weatherDisplay.classList.add('hidden');
    errorMessage.classList.add('hidden');
    loadingDiv.classList.remove('hidden');
}

function showWeather() {
    loadingDiv.classList.add('hidden');
    errorMessage.classList.add('hidden');
    weatherDisplay.classList.remove('hidden');
}

function showError(message) {
    loadingDiv.classList.add('hidden');
    weatherDisplay.classList.add('hidden');
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
}

function getCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return now.toLocaleDateString('en-US', options);
}

// ====================================
// 4. WEATHER MOOD FUNCTION (NEW!)
// ====================================
function setWeatherMood(weatherCondition) {
    const body = document.body;
    
    body.className = body.className.replace(/weather-mood-\w+/g, '');
    
    const condition = weatherCondition.toLowerCase();
    
    const now = new Date();
    const currentHour = now.getHours();
    const isDaytime = currentHour >= 6 && currentHour < 18;
    
    if (condition.includes('clear')) {
        body.classList.add(isDaytime ? 'weather-mood-sunny' : 'weather-mood-night');
    }
    else if (condition.includes('cloud')) {
        body.classList.add('weather-mood-cloudy');
    }
    else if (condition.includes('rain') || condition.includes('drizzle')) {
        body.classList.add('weather-mood-rainy');
    }
    else if (condition.includes('snow')) {
        body.classList.add('weather-mood-snowy');
    }
    else if (condition.includes('thunderstorm')) {
        body.classList.add('weather-mood-stormy');
    }
    else if (condition.includes('mist') || condition.includes('fog') || condition.includes('haze')) {
        body.classList.add('weather-mood-misty');
    }
    else {
        body.classList.add('weather-mood-default');
    }
}

// ====================================
// 5. MAIN FUNCTION: FETCH WEATHER DATA
// ====================================
async function fetchWeatherData(city) {
    showLoading();
    
    try {
        // API URL CONSTRUCTION 
        const url = `${BASE_URL}?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
        
        // API CALL 
        const response = await fetch(url);
        
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('City not found. Please check the spelling and try again.');
            } else if (response.status === 401) {
                throw new Error('Invalid API key. Please check your configuration.');
            } else {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
        }
        
        // Parse the JSON response
        const data = await response.json();
        

        updateWeatherUI(data);
        
    } catch (error) {
        showError(error.message);
    }
}

// ====================================
// 6. UPDATE UI WITH WEATHER DATA
// ====================================
function updateWeatherUI(data) {
    // Extract data from API response
    const city = data.name;
    const country = data.sys.country;
    const temp = Math.round(data.main.temp);
    const feelsLikeTemp = Math.round(data.main.feels_like);
    const weatherCond = data.weather[0].main;
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon; 
    
    
    const wind = Math.round(data.wind.speed * 3.6); // Convert m/s to km/h
    const hum = data.main.humidity;
    const pres = data.main.pressure;
    
    // Update all text elements
    cityName.textContent = `${city}, ${country}`;
    currentDate.textContent = getCurrentDate();
    temperature.textContent = temp;
    condition.textContent = description.charAt(0).toUpperCase() + description.slice(1);
    feelsLike.textContent = feelsLikeTemp;
    windSpeed.textContent = `${wind} km/h`;
    humidity.textContent = `${hum}%`;
    pressure.textContent = `${pres} hPa`;
    
   
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = description;
    
    setWeatherMood(weatherCond);
    
    // Show the weather display
    showWeather();
}

// ====================================
// 7. EVENT LISTENERS
// ====================================
// Search button click
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    
    if (city) {
        fetchWeatherData(city);
        // Clear input after search
        cityInput.value = '';
    } else {
        showError('Please enter a city name.');
    }
});

// Enter key press in input field
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// Focus the input on page load
window.addEventListener('load', () => {
    cityInput.focus();
    
});
