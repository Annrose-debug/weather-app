// ============================================================
// WeatherNow — script.js
// Clean, modular structure with better error handling
// ============================================================

// ── 1. CONFIG ────────────────────────────────────────────────
const CONFIG = {
  apiKey: '4ec347f659266cc1f12950bfec63f775',
  baseUrl: 'https://api.openweathermap.org/data/2.5/weather',
  iconUrl: (code) => `https://openweathermap.org/img/wn/${code}@2x.png`,
};

// ── 2. DOM REFERENCES ────────────────────────────────────────
const $ = (id) => document.getElementById(id);

const els = {
  input:       $('cityInput'),
  searchBtn:   $('searchBtn'),
  loading:     $('loading'),
  display:     $('weatherDisplay'),
  error:       $('errorMessage'),
  errorText:   $('errorText'),
  cityName:    $('cityName'),
  date:        $('currentDate'),
  temp:        $('temperature'),
  icon:        $('weatherIcon'),
  condition:   $('condition'),
  feelsLike:   $('feelsLike'),
  wind:        $('windSpeed'),
  humidity:    $('humidity'),
  pressure:    $('pressure'),
  visibility:  $('visibility'),
};

// ── 3. UI STATE HELPERS ──────────────────────────────────────
const ui = {
  showLoading() {
    els.display.classList.add('hidden');
    els.error.classList.add('hidden');
    els.loading.classList.remove('hidden');
  },
  showWeather() {
    els.loading.classList.add('hidden');
    els.error.classList.add('hidden');
    els.display.classList.remove('hidden');
  },
  showError(msg) {
    els.loading.classList.add('hidden');
    els.display.classList.add('hidden');
    els.errorText.textContent = msg;
    // Re-trigger shake animation
    els.error.classList.remove('hidden');
    void els.error.offsetWidth; // reflow trick
    els.error.classList.remove('hidden');
  },
};

// ── 4. UTILITIES ─────────────────────────────────────────────
function formatDate(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function msToKmh(ms) {
  return Math.round(ms * 3.6);
}

function mToKm(meters) {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)} km`
    : `${meters} m`;
}

// ── 5. WEATHER MOOD ──────────────────────────────────────────
const MOOD_MAP = [
  { match: 'thunderstorm', mood: 'stormy' },
  { match: 'drizzle',      mood: 'rainy'  },
  { match: 'rain',         mood: 'rainy'  },
  { match: 'snow',         mood: 'snowy'  },
  { match: 'mist',         mood: 'misty'  },
  { match: 'smoke',        mood: 'misty'  },
  { match: 'haze',         mood: 'misty'  },
  { match: 'dust',         mood: 'misty'  },
  { match: 'fog',          mood: 'misty'  },
  { match: 'cloud',        mood: 'cloudy' },
  { match: 'clear',        mood: null     }, // determined by time below
];

function applyWeatherMood(conditionMain) {
  const body = document.body;

  // Remove any existing mood class
  body.className = body.className.replace(/\bweather-mood-\S+/g, '').trim();

  const key = conditionMain.toLowerCase();
  const entry = MOOD_MAP.find(({ match }) => key.includes(match));

  let mood;
  if (!entry) {
    mood = 'default';
  } else if (entry.mood === null) {
    // Clear sky: sunny or night depending on hour
    const hour = new Date().getHours();
    mood = (hour >= 6 && hour < 20) ? 'sunny' : 'night';
  } else {
    mood = entry.mood;
  }

  body.classList.add(`weather-mood-${mood}`);
}

// ── 6. RENDER WEATHER ────────────────────────────────────────
function renderWeather(data) {
  const { name, sys, main, weather, wind, visibility } = data;

  els.cityName.textContent   = `${name}, ${sys.country}`;
  els.date.textContent       = formatDate();
  els.temp.textContent       = Math.round(main.temp);
  els.feelsLike.textContent  = Math.round(main.feels_like);
  els.condition.textContent  = weather[0].description;
  els.wind.textContent       = `${msToKmh(wind.speed)} km/h`;
  els.humidity.textContent   = `${main.humidity}%`;
  els.pressure.textContent   = `${main.pressure} hPa`;
  els.visibility.textContent = visibility ? mToKm(visibility) : '—';

  els.icon.src = CONFIG.iconUrl(weather[0].icon);
  els.icon.alt = weather[0].description;

  applyWeatherMood(weather[0].main);
  ui.showWeather();
}

// ── 7. FETCH ─────────────────────────────────────────────────
async function fetchWeather(city) {
  ui.showLoading();

  const url = `${CONFIG.baseUrl}?q=${encodeURIComponent(city)}&units=metric&appid=${CONFIG.apiKey}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      const messages = {
        404: 'City not found. Please check the spelling and try again.',
        401: 'Invalid API key. Please check your configuration.',
      };
      throw new Error(messages[res.status] ?? `Unexpected error (${res.status}).`);
    }

    const data = await res.json();
    renderWeather(data);

  } catch (err) {
    // Handle network errors separately from API errors
    const msg = err instanceof TypeError
      ? 'Network error. Please check your connection.'
      : err.message;
    ui.showError(msg);
  }
}

// ── 8. SEARCH HANDLER ────────────────────────────────────────
function handleSearch() {
  const city = els.input.value.trim();
  if (!city) {
    ui.showError('Please enter a city name.');
    return;
  }
  els.input.value = '';
  fetchWeather(city);
}

// ── 9. EVENT LISTENERS ───────────────────────────────────────
els.searchBtn.addEventListener('click', handleSearch);

els.input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSearch();
});

// Focus input on load
window.addEventListener('load', () => els.input.focus());
