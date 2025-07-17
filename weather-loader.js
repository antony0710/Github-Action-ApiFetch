// Weather data helper functions
class WeatherDataLoader {
    constructor() {
        this.baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
        this.cache = new Map();
        this.maxCacheSize = 50;
    }
    
    async getAvailableFiles() {
        // Try to get files from a directory listing (if available)
        // This is a fallback approach since we can't directly list files
        const files = [];
        const now = new Date();
        
        // Try files from the last 7 days
        for (let day = 0; day < 7; day++) {
            const date = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
            
            // Try multiple times per day
            for (let hour = 0; hour < 24; hour++) {
                const testDate = new Date(date);
                testDate.setHours(hour, 0, 0, 0);
                
                const filename = this.formatFilename(testDate);
                
                try {
                    const response = await fetch(`${this.baseUrl}/weather_data/${filename}`, {
                        method: 'HEAD'
                    });
                    
                    if (response.ok) {
                        files.push(filename);
                    }
                } catch (e) {
                    // File doesn't exist, continue
                }
            }
        }
        
        return files.sort().reverse(); // Most recent first
    }
    
    formatFilename(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        const second = String(date.getSeconds()).padStart(2, '0');
        
        return `weather_${year}${month}${day}_${hour}${minute}${second}.json`;
    }
    
    async loadWeatherData(filename) {
        // Check cache first
        if (this.cache.has(filename)) {
            return this.cache.get(filename);
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/weather_data/${filename}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Cache the data
            this.cache.set(filename, data);
            
            // Limit cache size
            if (this.cache.size > this.maxCacheSize) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }
            
            return data;
            
        } catch (error) {
            console.error(`Error loading weather data from ${filename}:`, error);
            throw error;
        }
    }
    
    async getLatestWeatherData() {
        const files = await this.getAvailableFiles();
        
        if (files.length === 0) {
            throw new Error('No weather data files found');
        }
        
        return await this.loadWeatherData(files[0]);
    }
    
    async getWeatherHistory(count = 24) {
        const files = await this.getAvailableFiles();
        const historyData = [];
        
        for (let i = 0; i < Math.min(files.length, count); i++) {
            try {
                const data = await this.loadWeatherData(files[i]);
                historyData.push({
                    filename: files[i],
                    data: data,
                    timestamp: this.extractTimestamp(files[i])
                });
            } catch (error) {
                console.warn(`Failed to load ${files[i]}:`, error);
            }
        }
        
        return historyData;
    }
    
    extractTimestamp(filename) {
        const match = filename.match(/weather_(\d{8})_(\d{6})\.json/);
        if (match) {
            const [, dateStr, timeStr] = match;
            const year = parseInt(dateStr.substring(0, 4));
            const month = parseInt(dateStr.substring(4, 6)) - 1; // months are 0-indexed
            const day = parseInt(dateStr.substring(6, 8));
            const hour = parseInt(timeStr.substring(0, 2));
            const minute = parseInt(timeStr.substring(2, 4));
            const second = parseInt(timeStr.substring(4, 6));
            
            return new Date(year, month, day, hour, minute, second);
        }
        return null;
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherDataLoader;
} else {
    window.WeatherDataLoader = WeatherDataLoader;
}