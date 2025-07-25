import React, { useState, useEffect } from 'react';
import './App.css';
import CurrentWeather from './components/CurrentWeather';
import TemperatureReadings from './components/TemperatureReadings';
import RainfallData from './components/RainfallData';
import LightningWarnings from './components/LightningWarnings';
import TemperatureChart from './components/TemperatureChart';
import NineDayForecast from './components/NineDayForecast';
import { WeatherDataLoader } from './utils/WeatherDataLoader';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState('');
  const [forecastData, setForecastData] = useState(null);

  const weatherLoader = new WeatherDataLoader();

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      setLoadingProgress('Loading weather data...');

      // Get list of weather files
      const weatherFiles = await weatherLoader.getAvailableFiles();
      
      if (weatherFiles.length === 0) {
        throw new Error('No weather data files found');
      }

      // Load all weather data
      const allData = await loadAllWeatherData(weatherFiles);
      setHistoricalData(allData);

      // Set the most recent data as current
      if (allData.length > 0) {
        const latestData = allData[allData.length - 1];
        setWeatherData(latestData.data);
      }

      // Load forecast data
      await loadForecastData();

      setLoading(false);
    } catch (err) {
      console.error('Error loading weather data:', err);
      setError(`Error loading weather data: ${err.message}`);
      setLoading(false);
    }
  };

  const loadAllWeatherData = async (files) => {
    const historicalData = [];
    const batchSize = 10;
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      
      const progress = Math.min(100, Math.round((i / files.length) * 100));
      setLoadingProgress(`Loading weather data: ${progress}% (${i}/${files.length} files)`);
      
      const promises = batch.map(async (filename) => {
        try {
          const data = await weatherLoader.loadWeatherData(filename);
          const timestamp = weatherLoader.extractTimestamp(filename);
          
          return {
            timestamp: timestamp,
            filename: filename,
            data: data
          };
        } catch (error) {
          console.warn(`Error loading ${filename}:`, error);
          return null;
        }
      });
      
      const batchResults = await Promise.all(promises);
      batchResults.forEach(result => {
        if (result) {
          historicalData.push(result);
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    historicalData.sort((a, b) => a.timestamp - b.timestamp);
    setLoadingProgress(`Loaded ${historicalData.length} weather files successfully`);
    
    return historicalData;
  };

  const loadForecastData = async () => {
    try {
      const forecastFiles = await getForecastFiles();
      
      if (forecastFiles.length > 0) {
        const response = await fetch(`NineDayForecast/${forecastFiles[0]}`);
        if (response.ok) {
          const data = await response.json();
          setForecastData(data);
          return;
        }
      }
      
      // Fallback to sample data
      const response = await fetch('NineDayForecast/forecast_sample.json');
      if (response.ok) {
        const data = await response.json();
        setForecastData(data);
      }
    } catch (error) {
      console.error('Error loading forecast data:', error);
    }
  };

  const getForecastFiles = async () => {
    try {
      const response = await fetch('NineDayForecast/index.json');
      if (response.ok) {
        const indexData = await response.json();
        if (indexData.files && Array.isArray(indexData.files)) {
          return indexData.files.sort().reverse();
        }
      }
    } catch (error) {
      console.warn('Forecast index.json not found, falling back to file discovery');
    }
    
    return [];
  };

  useEffect(() => {
    loadWeatherData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(loadWeatherData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getLastUpdatedTime = () => {
    if (weatherData && weatherData.updateTime) {
      return new Date(weatherData.updateTime).toLocaleString();
    }
    return '--';
  };

  return (
    <div className="app">
      <div className="container">
        <h1>🌦️ Hong Kong Weather Dashboard</h1>
        
        {loading && (
          <div className="loading">
            <div>Loading weather data...</div>
            <div className="loading-progress">{loadingProgress}</div>
          </div>
        )}
        
        {error && (
          <div className="error">{error}</div>
        )}
        
        {!loading && !error && weatherData && (
          <div className="weather-content">
            <div className="weather-grid">
              <CurrentWeather data={weatherData} />
              <TemperatureReadings data={weatherData} />
              <RainfallData data={weatherData} />
              <LightningWarnings data={weatherData} />
            </div>
            
            <TemperatureChart historicalData={historicalData} />
            <NineDayForecast forecastData={forecastData} />
            
            <div className="last-updated">
              <div>Last Updated: <span>{getLastUpdatedTime()}</span></div>
              <button className="refresh-btn" onClick={loadWeatherData}>
                🔄 Refresh Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;