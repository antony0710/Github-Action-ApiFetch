import React from 'react';

const LightningWarnings = ({ data }) => {
  if (!data || !data.lightning?.data || data.lightning.data.length === 0) return null;

  const hasLightning = data.lightning.data.some(lightning => lightning.occur === 'true');
  
  if (!hasLightning) return null;

  return (
    <div className="weather-card">
      <h3>⚡ Lightning Warnings</h3>
      <div>
        {data.lightning.data.map((lightning, index) => (
          lightning.occur === 'true' && (
            <div key={index} className="warning alert">
              Lightning detected in {lightning.place}
            </div>
          )
        ))}
        {data.lightning.startTime && data.lightning.endTime && (
          <div className="lightning-time">
            Valid from {new Date(data.lightning.startTime).toLocaleString()} to {new Date(data.lightning.endTime).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default LightningWarnings;