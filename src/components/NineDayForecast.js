import React from 'react';

const forecastIcons = {
  50: '☀️',   // Sunny
  51: '🌤️',   // Sunny Periods
  52: '🌤️',   // Sunny Intervals
  53: '🌦️',   // Sunny Periods with A Few Showers
  54: '🌦️',   // Sunny Intervals with Showers
  60: '☁️',   // Cloudy
  61: '⛅',   // Overcast
  62: '🌧️',   // Light Rain
  63: '🌧️',   // Rain
  64: '🌧️',   // Heavy Rain
  65: '⛈️',   // Thunderstorms
  70: '🌨️',   // Fine
  71: '❄️',   // Light Snow
  72: '❄️',   // Snow
  73: '❄️',   // Heavy Snow
  80: '🌫️',   // Windy
  81: '🌪️',   // Dry
  82: '🌪️',   // Humid
  83: '🌫️',   // Fog
  84: '🌫️',   // Mist
  85: '🌫️',   // Haze
  default: '🌤️'
};

const NineDayForecast = ({ forecastData }) => {
  const getForecastIcon = (iconCode) => {
    return forecastIcons[iconCode] || forecastIcons.default;
  };

  if (!forecastData) {
    return (
      <div className="weather-card">
        <h3>🌤️ 9-Day Weather Forecast</h3>
        <div className="loading">Loading forecast data...</div>
      </div>
    );
  }

  return (
    <div className="weather-card">
      <h3>🌤️ 9-Day Weather Forecast</h3>
      
      {forecastData.generalSituation && (
        <div className="general-situation">
          <strong>天氣概況:</strong> {forecastData.generalSituation}
        </div>
      )}
      
      {forecastData.weatherForecast && forecastData.weatherForecast.length > 0 && (
        <div className="forecast-grid">
          {forecastData.weatherForecast.map((forecast, index) => {
            const date = forecast.forecastDate;
            const formattedDate = `${date.substring(4, 6)}/${date.substring(6, 8)}`;
            const icon = getForecastIcon(forecast.ForecastIcon);
            
            return (
              <div key={index} className="forecast-item">
                <div className="forecast-date">{formattedDate}</div>
                <div className="forecast-week">{forecast.week}</div>
                <div className="forecast-icon">{icon}</div>
                <div className="forecast-temp">
                  {forecast.forecastMintemp.value}°-{forecast.forecastMaxtemp.value}°C
                </div>
                <div className="forecast-weather">{forecast.forecastWeather}</div>
                <div className="forecast-details">
                  降雨機率: {forecast.PSR}<br />
                  濕度: {forecast.forecastMinrh.value}-{forecast.forecastMaxrh.value}%
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NineDayForecast;