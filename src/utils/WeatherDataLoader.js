// Weather data helper functions
export class WeatherDataLoader {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 50;
  }

  async loadWeatherHistory(onProgress) {
    try {
      onProgress?.('Loading consolidated weather history...');
      const response = await fetch('weather_data/history.json');

      if (!response.ok) {
        throw new Error(`Failed to load history.json: ${response.status}`);
      }

      const payload = await response.json();
      const historicalData = this.normalizeHistoryEntries(payload.history || []);
      const latestData = payload.latest?.data || historicalData[historicalData.length - 1]?.data || null;

      if (historicalData.length === 0 || !latestData) {
        throw new Error('Invalid format in history.json');
      }

      onProgress?.(`Loaded ${historicalData.length} weather snapshots`);
      return { historicalData, latestData };
    } catch (error) {
      console.warn('Falling back to legacy weather file loading:', error);
      return this.loadLegacyWeatherHistory(onProgress);
    }
  }

  normalizeHistoryEntries(entries) {
    return entries
      .filter((entry) => entry?.timestamp && entry?.temperature)
      .map((entry) => ({
        timestamp: new Date(entry.timestamp),
        filename: entry.filename,
        data: {
          updateTime: entry.updateTime,
          temperature: entry.temperature
        }
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  async loadLegacyWeatherHistory(onProgress) {
    const weatherFiles = await this.getAvailableFiles();

    if (weatherFiles.length === 0) {
      throw new Error('No weather data files found');
    }

    const historicalData = [];
    const batchSize = 10;

    for (let i = 0; i < weatherFiles.length; i += batchSize) {
      const batch = weatherFiles.slice(i, i + batchSize);
      const progress = Math.min(100, Math.round((i / weatherFiles.length) * 100));
      onProgress?.(`Loading weather data: ${progress}% (${i}/${weatherFiles.length} files)`);

      const batchResults = await Promise.all(batch.map(async (filename) => {
        try {
          const data = await this.loadWeatherData(filename);
          return {
            timestamp: this.extractTimestamp(filename),
            filename,
            data
          };
        } catch (error) {
          console.warn(`Error loading ${filename}:`, error);
          return null;
        }
      }));

      batchResults.forEach((result) => {
        if (result) {
          historicalData.push(result);
        }
      });

      await new Promise(resolve => setTimeout(resolve, 50));
    }

    historicalData.sort((a, b) => a.timestamp - b.timestamp);
    onProgress?.(`Loaded ${historicalData.length} weather files successfully`);

    return {
      historicalData,
      latestData: historicalData[historicalData.length - 1]?.data || null
    };
  }
  
  async getAvailableFiles() {
    try {
      // Load the index.json file to get the list of all weather files
      const response = await fetch('weather_data/index.json');
      
      if (!response.ok) {
        throw new Error(`Failed to load index.json: ${response.status}`);
      }
      
      const indexData = await response.json();
      
      if (!indexData.files || !Array.isArray(indexData.files)) {
        throw new Error('Invalid format in index.json');
      }
      
      // Sort files by filename (which includes timestamp) in descending order
      const sortedFiles = indexData.files.sort((a, b) => b.localeCompare(a));
      
      console.log(`Found ${sortedFiles.length} weather files in index.json`);
      
      return sortedFiles;
      
    } catch (error) {
      console.error('Error loading weather files index:', error);
      
      // Fallback to hardcoded list if index.json is not available
      console.log('Falling back to hardcoded file list');
      const fallbackFiles = [
        'weather_20250717_083026.json',
        'weather_20250716_231010.json',
        'weather_20250716_221011.json',
        'weather_20250716_210946.json',
        'weather_20250716_201128.json',
        'weather_20250716_191003.json',
        'weather_20250716_181438.json',
        'weather_20250716_171220.json',
        'weather_20250716_161300.json',
        'weather_20250716_151053.json'
      ];
      
      return fallbackFiles;
    }
  }
  
  async loadWeatherData(filename) {
    // Check cache first
    if (this.cache.has(filename)) {
      return this.cache.get(filename);
    }
    
    try {
      const response = await fetch(`weather_data/${filename}`);
      
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
    return new Date();
  }
}
