import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const TemperatureChart = ({ historicalData }) => {
  const [timeRange, setTimeRange] = useState('all');
  const [locationFilter, setLocationFilter] = useState('香港天文台');
  const [locations, setLocations] = useState(new Set(['香港天文台']));

  useEffect(() => {
    if (historicalData && historicalData.length > 0) {
      const allLocations = new Set();
      historicalData.forEach(item => {
        if (item.data.temperature && item.data.temperature.data) {
          item.data.temperature.data.forEach(temp => {
            allLocations.add(temp.place);
          });
        }
      });
      setLocations(allLocations);
    }
  }, [historicalData]);

  const getFilteredData = () => {
    if (!historicalData || historicalData.length === 0) return [];

    let filteredData = historicalData;
    if (timeRange !== 'all') {
      const hoursBack = parseInt(timeRange);
      const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
      filteredData = historicalData.filter(item => item.timestamp >= cutoffTime);
    }

    return filteredData;
  };

  const getChartData = () => {
    const filteredData = getFilteredData();
    const datasets = [];

    if (locationFilter === 'all') {
      const colors = [
        '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff',
        '#ff9f40', '#ff6384', '#c9cbcf', '#4bc0c0', '#ff6384'
      ];
      
      const locationData = {};
      
      filteredData.forEach(item => {
        if (item.data.temperature && item.data.temperature.data) {
          item.data.temperature.data.forEach(temp => {
            if (!locationData[temp.place]) {
              locationData[temp.place] = [];
            }
            locationData[temp.place].push({
              x: item.timestamp,
              y: temp.value
            });
          });
        }
      });
      
      let colorIndex = 0;
      Object.keys(locationData).slice(0, 5).forEach(location => {
        datasets.push({
          label: location,
          data: locationData[location],
          borderColor: colors[colorIndex % colors.length],
          backgroundColor: colors[colorIndex % colors.length] + '20',
          fill: false,
          tension: 0.1
        });
        colorIndex++;
      });
    } else {
      const temperatureData = [];
      
      filteredData.forEach(item => {
        if (item.data.temperature && item.data.temperature.data) {
          const temp = item.data.temperature.data.find(t => t.place === locationFilter);
          if (temp) {
            temperatureData.push({
              x: item.timestamp,
              y: temp.value
            });
          }
        }
      });
      
      datasets.push({
        label: locationFilter,
        data: temperatureData,
        borderColor: '#74b9ff',
        backgroundColor: '#74b9ff20',
        fill: false,
        tension: 0.1
      });
    }

    return { datasets };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Temperature Over Time'
      },
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          displayFormats: {
            hour: 'MM/dd HH:mm'
          }
        },
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Temperature (°C)'
        }
      }
    },
    elements: {
      point: {
        radius: 3
      }
    }
  };

  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="weather-card">
        <h3>📊 Temperature History</h3>
        <div>No historical data available</div>
      </div>
    );
  }

  return (
    <div className="weather-card">
      <h3>📊 Temperature History</h3>
      <div className="chart-controls">
        <label htmlFor="time-range">Time Range:</label>
        <select 
          id="time-range" 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="24">Last 24 Hours</option>
          <option value="48">Last 48 Hours</option>
          <option value="72">Last 72 Hours</option>
          <option value="168">Last 7 Days</option>
          <option value="all">All Time</option>
        </select>
        <label htmlFor="location-filter">Location:</label>
        <select 
          id="location-filter"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        >
          <option value="香港天文台">香港天文台</option>
          <option value="all">All Locations</option>
          {Array.from(locations).filter(loc => loc !== '香港天文台').map(location => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>
      </div>
      <div className="chart-container">
        <Line data={getChartData()} options={options} />
      </div>
    </div>
  );
};

export default TemperatureChart;