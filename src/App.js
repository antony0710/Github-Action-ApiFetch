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
      const { historicalData: allData, latestData } = await weatherLoader.loadWeatherHistory(setLoadingProgress);
      setHistoricalData(allData);
      setWeatherData(latestData);

      // Load forecast data
      await loadForecastData();

      setLoading(false);
    } catch (err) {
      console.error('Error loading weather data:', err);
      setError(`Error loading weather data: ${err.message}`);
      setLoading(false);
    }
  };

  const loadForecastData = async () => {
    try {
      const latestResponse = await fetch('NineDayForecast/latest.json');
      if (latestResponse.ok) {
        const latestData = await latestResponse.json();
        setForecastData(latestData);
        return;
      }

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
