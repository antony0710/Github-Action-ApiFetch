import React from 'react';

const TemperatureReadings = ({ data }) => {
  if (!data || !data.temperature?.data) return null;

  return (
    <div className="weather-card">
      <h3>Temperature Readings</h3>
      <div className="locations-grid">
        {data.temperature.data.map((temp, index) => (
          <div key={index} className="location-item">
            <div className="location-name">{temp.place}</div>
            <div className="location-value">{temp.value}°{temp.unit}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemperatureReadings;