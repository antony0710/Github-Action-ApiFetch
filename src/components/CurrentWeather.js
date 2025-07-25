import React from 'react';

const weatherIcons = {
  50: '☀️',  // Sunny
  51: '🌤️',  // Sunny Periods
  52: '🌤️',  // Sunny Intervals
  53: '🌤️',  // Sunny Periods with A Few Showers
  54: '🌤️',  // Sunny Intervals with Showers
  60: '☁️',  // Cloudy
  61: '⛅',  // Overcast
  62: '🌩️',  // Light Rain
  63: '🌧️',  // Rain
  64: '⛈️',  // Heavy Rain
  65: '⛈️',  // Thunderstorms
  70: '🌨️',  // Fine
  71: '🌨️',  // Light Snow
  72: '❄️',  // Snow
  73: '❄️',  // Heavy Snow
  74: '🌨️',  // Sleet
  75: '🌨️',  // Light Sleet
  76: '🌨️',  // Sleet and Snow
  77: '🌨️',  // Hail
  80: '🌫️',  // Windy
  81: '🌪️',  // Dry
  82: '🌪️',  // Humid
  83: '🌫️',  // Fog
  84: '🌫️',  // Mist
  85: '🌫️',  // Haze
  90: '🌡️',  // Hot
  91: '🌡️',  // Warm
  92: '🧊',  // Cool
  93: '🧊',  // Cold
  default: '🌤️'
};

const CurrentWeather = ({ data }) => {
  if (!data) return null;

  // Get weather icon
  const weatherIcon = data.icon && data.icon[0] ? 
    weatherIcons[data.icon[0]] || weatherIcons.default : weatherIcons.default;

  // Get temperature (use Hong Kong Observatory as primary)
  const hkoTemp = data.temperature?.data?.find(t => t.place === '香港天文台');
  const temperature = hkoTemp ? 
    `${hkoTemp.value}°${hkoTemp.unit}` : 
    (data.temperature?.data?.length > 0 ? 
      `${data.temperature.data[0].value}°${data.temperature.data[0].unit}` : '--°C');

  // Get humidity
  const humidity = data.humidity?.data?.length > 0 ? 
    `Humidity: ${data.humidity.data[0].value}%` : 'Humidity: --%';

  // Get UV index
  const uvIndex = data.uvindex?.data?.length > 0 ? 
    `UV Index: ${data.uvindex.data[0].value} (${data.uvindex.data[0].desc})` : '';

  return (
    <div className="weather-card">
      <h3>Current Weather</h3>
      <div className="current-weather">
        <div className="weather-icon">{weatherIcon}</div>
        <div className="weather-details">
          <div className="temperature">{temperature}</div>
          <div className="humidity">{humidity}</div>
          {uvIndex && <div className="uv-index">{uvIndex}</div>}
        </div>
      </div>
      {data.warningMessage && data.warningMessage.length > 0 && (
        <div className="warnings">
          {data.warningMessage.map((warning, index) => (
            <div key={index} className="warning alert">
              {warning}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrentWeather;