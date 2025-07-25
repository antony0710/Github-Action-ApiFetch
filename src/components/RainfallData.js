import React from 'react';

const RainfallData = ({ data }) => {
  if (!data || !data.rainfall?.data) return null;

  return (
    <div className="weather-card">
      <h3>Rainfall Data</h3>
      <div>
        {data.rainfall.data.map((rain, index) => {
          let rainfallText = '';
          if (rain.max !== undefined) {
            if (rain.min !== undefined) {
              rainfallText = `${rain.min}-${rain.max} ${rain.unit}`;
            } else {
              rainfallText = `${rain.max} ${rain.unit}`;
            }
          }

          return (
            <div key={index} className="rainfall-item">
              <span>{rain.place}</span>
              <span className="rainfall-value">{rainfallText}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RainfallData;