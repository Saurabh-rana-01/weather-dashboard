/**
 * Weather Dashboard - Main Application
 * Handles UI interactions and data management
 */

class WeatherDashboard {
    constructor() {
        this.currentWeatherData = null;
        this.forecastData = null;
        this.savedLocations = this.loadSavedLocations();
        this.initializeElements();
        this.attachEventListeners();
        this.loadDefaultLocation();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.elements = {
            // Search elements
            searchInput: document.getElementById('searchInput'),
            searchBtn: document.getElementById('searchBtn'),
            geolocationBtn: document.getElementById('geolocationBtn'),
            suggestionsDropdown: document.getElementById('suggestionsDropdown'),

            // Current weather elements
            currentWeatherLoader: document.getElementById('currentWeatherLoader'),
            currentWeatherContent: document.getElementById('currentWeatherContent'),
            errorMessage: document.getElementById('errorMessage'),
            errorText: document.getElementById('errorText'),
            cityName: document.getElementById('cityName'),
            currentDate: document.getElementById('currentDate'),
            temperature: document.getElementById('temperature'),
            weatherDescription: document.getElementById('weatherDescription'),
            weatherIcon: document.getElementById('weatherIcon'),
            humidity: document.getElementById('humidity'),
            windSpeed: document.getElementById('windSpeed'),
            pressure: document.getElementById('pressure'),
            visibility: document.getElementById('visibility'),
            feelsLike: document.getElementById('feelsLike'),
            cloudiness: document.getElementById('cloudiness'),

            // Forecast elements
            hourlyForecast: document.getElementById('hourlyForecast'),
            dailyForecast: document.getElementById('dailyForecast'),
            savedLocations: document.getElementById('savedLocations')
        };
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        this.elements.searchBtn.addEventListener('click', () => this.handleSearch());
        this.elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        this.elements.searchInput.addEventListener('input', (e) => this.handleSearchInput(e));
        this.elements.geolocationBtn.addEventListener('click', () => this.handleGeolocation());
        document.addEventListener('click', (e) => {
            if (e.target !== this.elements.searchInput) {
                this.elements.suggestionsDropdown.classList.remove('active');
            }
        });
    }

    /**
     * Load default location (last searched or London)
     */
    async loadDefaultLocation() {
        const lastLocation = localStorage.getItem('lastSearchedLocation');
        if (lastLocation) {
            await this.fetchWeatherByCity(lastLocation);
        } else {
            await this.fetchWeatherByCity('London');
        }
    }

    /**
     * Handle search input with suggestions
     */
    async handleSearchInput(e) {
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            this.elements.suggestionsDropdown.classList.remove('active');
            return;
        }

        try {
            const suggestions = await weatherAPI.getGeocoding(query, 5);
            this.displaySuggestions(suggestions);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    }

    /**
     * Display suggestions dropdown
     */
    displaySuggestions(suggestions) {
        if (!suggestions.length) {
            this.elements.suggestionsDropdown.classList.remove('active');
            return;
        }

        this.elements.suggestionsDropdown.innerHTML = suggestions
            .map(suggestion => `
                <div class="suggestion-item" data-lat="${suggestion.lat}" data-lon="${suggestion.lon}">
                    <strong>${suggestion.name}</strong>${suggestion.state ? ', ' + suggestion.state : ''}<br>
                    <small>${suggestion.country}</small>
                </div>
            `)
            .join('');

        this.elements.suggestionsDropdown.classList.add('active');

        // Add click handlers to suggestions
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const lat = parseFloat(item.dataset.lat);
                const lon = parseFloat(item.dataset.lon);
                this.fetchWeatherByCoords(lat, lon);
                this.elements.suggestionsDropdown.classList.remove('active');
            });
        });
    }

    /**
     * Handle search button click
     */
    async handleSearch() {
        const city = this.elements.searchInput.value.trim();
        if (city) {
            await this.fetchWeatherByCity(city);
            this.elements.suggestionsDropdown.classList.remove('active');
        }
    }

    /**
     * Handle geolocation
     */
    async handleGeolocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by your browser');
            return;
        }

        this.elements.geolocationBtn.disabled = true;
        this.elements.geolocationBtn.innerHTML = '<i class="fas fa-spinner"></i>';

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await this.fetchWeatherByCoords(latitude, longitude);
                this.elements.geolocationBtn.disabled = false;
                this.elements.geolocationBtn.innerHTML = '<i class="fas fa-location-dot"></i>';
            },
            (error) => {
                this.showError('Unable to access your location');
                this.elements.geolocationBtn.disabled = false;
                this.elements.geolocationBtn.innerHTML = '<i class="fas fa-location-dot"></i>';
                console.error('Geolocation error:', error);
            }
        );
    }

    /**
     * Fetch weather by city name
     */
    async fetchWeatherByCity(cityName) {
        try {
            this.showLoading();
            const data = await weatherAPI.getCurrentWeatherByCity(cityName);
            const forecastData = await weatherAPI.getForecast(data.coord.lat, data.coord.lon);
            
            this.currentWeatherData = data;
            this.forecastData = forecastData;
            
            this.displayCurrentWeather(data);
            this.displayForecast(forecastData);
            this.updateSavedLocations();
            
            // Save last searched location
            localStorage.setItem('lastSearchedLocation', data.name);
            this.elements.searchInput.value = '';
        } catch (error) {
            this.showError(error.message || 'Failed to fetch weather data');
        }
    }

    /**
     * Fetch weather by coordinates
     */
    async fetchWeatherByCoords(lat, lon) {
        try {
            this.showLoading();
            const data = await weatherAPI.getCurrentWeatherByCoords(lat, lon);
            const forecastData = await weatherAPI.getForecast(lat, lon);
            
            this.currentWeatherData = data;
            this.forecastData = forecastData;
            
            this.displayCurrentWeather(data);
            this.displayForecast(forecastData);
            this.updateSavedLocations();
            
            // Save last searched location
            localStorage.setItem('lastSearchedLocation', data.name);
            this.elements.searchInput.value = '';
        } catch (error) {
            this.showError(error.message || 'Failed to fetch weather data');
        }
    }

    /**
     * Display current weather
     */
    displayCurrentWeather(data) {
        this.elements.cityName.textContent = `${data.name}, ${data.sys.country}`;
        this.elements.currentDate.textContent = weatherAPI.formatFullDate(data.dt);
        this.elements.temperature.textContent = `${Math.round(data.main.temp)}°C`;
        this.elements.weatherDescription.textContent = data.weather[0].description;
        this.elements.weatherIcon.src = weatherAPI.getWeatherIconUrl(data.weather[0].icon);
        this.elements.humidity.textContent = `${data.main.humidity}%`;
        this.elements.windSpeed.textContent = `${data.wind.speed} m/s`;
        this.elements.pressure.textContent = `${data.main.pressure} hPa`;
        this.elements.visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
        this.elements.feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
        this.elements.cloudiness.textContent = `${data.clouds.all}%`;

        this.hideLoading();
        this.hideError();
    }

    /**
     * Display forecast data
     */
    displayForecast(data) {
        // Group forecast data by day
        const dailyForecasts = {};
        const hourlyForecasts = data.list.slice(0, 8); // Next 24 hours (8 x 3-hour intervals)

        // Display hourly forecast
        this.elements.hourlyForecast.innerHTML = hourlyForecasts
            .map(forecast => `
                <div class="forecast-card">
                    <div class="forecast-time">${weatherAPI.getTimeFromTimestamp(forecast.dt)}</div>
                    <img src="${weatherAPI.getWeatherIconUrl(forecast.weather[0].icon)}" alt="Weather" class="forecast-icon">
                    <div class="forecast-temp">${Math.round(forecast.main.temp)}°C</div>
                    <div class="forecast-desc">${forecast.weather[0].description}</div>
                    <div class="forecast-details">
                        <div>💧 ${forecast.main.humidity}%</div>
                        <div>💨 ${forecast.wind.speed} m/s</div>
                    </div>
                </div>
            `)
            .join('');

        // Group and display daily forecast
        data.list.forEach(forecast => {
            const day = weatherAPI.getDayFromTimestamp(forecast.dt);
            if (!dailyForecasts[day] || forecast.dt % 86400 === 0) {
                dailyForecasts[day] = forecast;
            }
        });

        // Display 5-day forecast
        const days = Object.keys(dailyForecasts).slice(0, 5);
        this.elements.dailyForecast.innerHTML = days
            .map(day => {
                const forecast = dailyForecasts[day];
                return `
                    <div class="forecast-card">
                        <div class="forecast-time">${day}</div>
                        <img src="${weatherAPI.getWeatherIconUrl(forecast.weather[0].icon)}" alt="Weather" class="forecast-icon">
                        <div class="forecast-temp">${Math.round(forecast.main.temp_max)}°C</div>
                        <div class="forecast-desc">${forecast.weather[0].description}</div>
                        <div class="forecast-details">
                            <div>💧 ${forecast.main.humidity}%</div>
                            <div>💨 ${forecast.wind.speed} m/s</div>
                        </div>
                    </div>
                `;
            })
            .join('');
    }

    /**
     * Update saved locations display
     */
    updateSavedLocations() {
        if (!this.currentWeatherData) return;

        const location = {
            name: this.currentWeatherData.name,
            country: this.currentWeatherData.sys.country,
            temp: Math.round(this.currentWeatherData.main.temp),
            description: this.currentWeatherData.weather[0].description,
            lat: this.currentWeatherData.coord.lat,
            lon: this.currentWeatherData.coord.lon
        };

        // Add to saved locations if not already there
        const exists = this.savedLocations.some(
            loc => loc.name === location.name && loc.country === location.country
        );

        if (!exists && this.savedLocations.length < 5) {
            this.savedLocations.unshift(location);
            this.saveLoc();
        }

        this.renderSavedLocations();
    }

    /**
     * Render saved locations
     */
    renderSavedLocations() {
        if (this.savedLocations.length === 0) {
            this.elements.savedLocations.innerHTML = '<p class="no-saved">No saved locations yet. Search for a city to add.</p>';
            return;
        }

        this.elements.savedLocations.innerHTML = this.savedLocations
            .map((location, index) => `
                <div class="saved-location-btn" onclick="dashboard.fetchWeatherByCoords(${location.lat}, ${location.lon})">
                    <div class="saved-location-name">${location.name}</div>
                    <div class="saved-location-temp">${location.temp}°C</div>
                    <div class="saved-location-desc">${location.description}</div>
                    <button class="remove-location-btn" onclick="event.stopPropagation(); dashboard.removeLocation(${index})">Remove</button>
                </div>
            `)
            .join('');
    }

    /**
     * Remove location from saved
     */
    removeLocation(index) {
        this.savedLocations.splice(index, 1);
        this.saveLoc();
        this.renderSavedLocations();
    }

    /**
     * Save locations to localStorage
     */
    saveLoc() {
        localStorage.setItem('savedLocations', JSON.stringify(this.savedLocations));
    }

    /**
     * Load saved locations from localStorage
     */
    loadSavedLocations() {
        const saved = localStorage.getItem('savedLocations');
        return saved ? JSON.parse(saved) : [];
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.elements.currentWeatherLoader.style.display = 'flex';
        this.elements.currentWeatherContent.style.display = 'none';
        this.elements.errorMessage.style.display = 'none';
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        this.elements.currentWeatherLoader.style.display = 'none';
        this.elements.currentWeatherContent.style.display = 'block';
    }

    /**
     * Show error message
     */
    showError(message) {
        this.elements.errorText.textContent = message;
        this.elements.errorMessage.style.display = 'flex';
        this.elements.currentWeatherContent.style.display = 'none';
        this.elements.currentWeatherLoader.style.display = 'none';
    }

    /**
     * Hide error message
     */
    hideError() {
        this.elements.errorMessage.style.display = 'none';
    }
}

// Initialize dashboard when DOM is loaded
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    // Check if API key is set
    if (weatherAPI.apiKey === 'YOUR_API_KEY_HERE') {
        console.error('Please set your OpenWeatherMap API key in js/weather-api.js');
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; color: #fff;">
                <div style="max-width: 500px;">
                    <h1>⚙️ Configuration Required</h1>
                    <p style="font-size: 1.2rem; margin: 20px 0;">Please set your OpenWeatherMap API key.</p>
                    <ol style="text-align: left; margin: 30px 0; font-size: 1rem;">
                        <li>Visit <a href="https://openweathermap.org/api" target="_blank" style="color: #667eea;">OpenWeatherMap API</a></li>
                        <li>Sign up for a free account</li>
                        <li>Get your API key from the dashboard</li>
                        <li>Open <code style="background: rgba(255,255,255,0.1); padding: 5px;">js/weather-api.js</code></li>
                        <li>Replace <code style="background: rgba(255,255,255,0.1); padding: 5px;">YOUR_API_KEY_HERE</code> with your key</li>
                        <li>Reload this page</li>
                    </ol>
                </div>
            </div>
        `;
        return;
    }

    dashboard = new WeatherDashboard();
});
