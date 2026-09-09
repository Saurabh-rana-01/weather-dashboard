/**
 * Weather API Module
 * Handles all API calls to OpenWeatherMap
 */

class WeatherAPI {
    constructor() {
        // Free API Key from OpenWeatherMap
        // Sign up at https://openweathermap.org/api
        this.apiKey = 'YOUR_API_KEY_HERE'; // Replace with your actual API key
        this.baseURL = 'https://api.openweathermap.org/data/2.5';
        this.geoURL = 'https://api.openweathermap.org/geo/1.0';
    }

    /**
     * Get current weather by city name
     * @param {string} cityName - City name
     * @returns {Promise} Weather data
     */
    async getCurrentWeatherByCity(cityName) {
        try {
            const response = await fetch(
                `${this.baseURL}/weather?q=${cityName}&appid=${this.apiKey}&units=metric`
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('City not found');
                }
                throw new Error(`HTTP Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching current weather:', error);
            throw error;
        }
    }

    /**
     * Get current weather by coordinates
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {Promise} Weather data
     */
    async getCurrentWeatherByCoords(lat, lon) {
        try {
            const response = await fetch(
                `${this.baseURL}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
            );

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching weather by coordinates:', error);
            throw error;
        }
    }

    /**
     * Get 5-day forecast and hourly data
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {Promise} Forecast data
     */
    async getForecast(lat, lon) {
        try {
            const response = await fetch(
                `${this.baseURL}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
            );

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching forecast:', error);
            throw error;
        }
    }

    /**
     * Get geocoding data for city names
     * @param {string} cityName - City name
     * @param {number} limit - Result limit (default 5)
     * @returns {Promise} Geocoding data
     */
    async getGeocoding(cityName, limit = 5) {
        try {
            const response = await fetch(
                `${this.geoURL}/direct?q=${cityName}&limit=${limit}&appid=${this.apiKey}`
            );

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching geocoding data:', error);
            throw error;
        }
    }

    /**
     * Get reverse geocoding (coordinates to location)
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {Promise} Location data
     */
    async getReverseGeocoding(lat, lon) {
        try {
            const response = await fetch(
                `${this.geoURL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${this.apiKey}`
            );

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching reverse geocoding:', error);
            throw error;
        }
    }

    /**
     * Get weather icon URL
     * @param {string} iconCode - Icon code from API
     * @returns {string} Icon URL
     */
    getWeatherIconUrl(iconCode) {
        return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    }

    /**
     * Format timestamp to readable date
     * @param {number} timestamp - Unix timestamp
     * @returns {string} Formatted date
     */
    formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        const options = {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    }

    /**
     * Format date for display
     * @param {number} timestamp - Unix timestamp
     * @returns {string} Formatted date string
     */
    formatFullDate(timestamp) {
        const date = new Date(timestamp * 1000);
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return date.toLocaleDateString('en-US', options);
    }

    /**
     * Get time from timestamp
     * @param {number} timestamp - Unix timestamp
     * @returns {string} Time string
     */
    getTimeFromTimestamp(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    /**
     * Get day name from timestamp
     * @param {number} timestamp - Unix timestamp
     * @returns {string} Day name
     */
    getDayFromTimestamp(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
}

// Export for use in other modules
const weatherAPI = new WeatherAPI();
