# Hong Kong Weather Dashboard

A real-time weather data visualization dashboard for Hong Kong, automatically updated via GitHub Actions.

## 🌟 Features

- **Real-time Weather Data**: Displays current temperature, humidity, and UV index
- **Multi-location Temperature Readings**: Shows temperature across 27 different locations in Hong Kong
- **Rainfall Data**: Displays rainfall information for all Hong Kong districts
- **Weather Warnings**: Shows active weather warnings and alerts
- **Lightning Detection**: Displays lightning warnings when active
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Auto-refresh**: Data refreshes every 5 minutes automatically
- **Manual Refresh**: Click the refresh button to update data instantly

## 🚀 Live Demo

The dashboard is available at: `https://[your-username].github.io/Github-Action-ApiFetch/`

## 📊 Data Source

The weather data is fetched from the Hong Kong Observatory API:
- **API**: `https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=tc`
- **Update Frequency**: Every hour via GitHub Actions
- **Data Format**: Consolidated JSON files stored in the `weather_data/` and `NineDayForecast/` directories

## 🔧 How It Works

1. **Data Collection**: A GitHub Action runs every hour to fetch weather data from the Hong Kong Observatory API
2. **Data Storage**: Hourly weather history is appended to `weather_data/history.json`, and the latest forecast is written to `NineDayForecast/latest.json`
3. **Visualization**: The GitHub Pages site loads the consolidated files directly to reduce repeated requests
4. **Auto-update**: The dashboard automatically refreshes every 5 minutes to show the latest data

## 📁 Repository Structure

```
├── index.html              # Main dashboard HTML file
├── weather-loader.js        # JavaScript helper for loading weather data
├── _config.yml             # GitHub Pages configuration
├── weather_data/           # Consolidated weather history for the dashboard
│   └── history.json
├── NineDayForecast/        # Latest 9-day forecast payload for the dashboard
│   └── latest.json
└── .github/workflows/
    └── ActionFlow.yaml     # GitHub Action for data collection
```

## 🎨 Dashboard Components

### Current Weather Card
- Weather icon based on current conditions
- Current temperature (from Hong Kong Observatory)
- Humidity percentage
- UV index with description
- Active weather warnings

### Temperature Readings Card
- Temperature readings from 27 locations across Hong Kong
- Real-time updates
- Responsive grid layout

### Rainfall Data Card
- Rainfall measurements for all 18 Hong Kong districts
- Shows rainfall amounts in mm
- Supports range values (e.g., 0-2 mm)

### Lightning Warnings Card
- Shows active lightning warnings
- Displays affected areas
- Shows warning validity period

## 🛠️ Technical Implementation

- **Frontend**: Pure HTML, CSS, and JavaScript (no framework dependencies)
- **Styling**: Modern CSS with responsive design and gradient backgrounds
- **Icons**: Emoji-based weather icons for cross-platform compatibility
- **Data Loading**: Asynchronous JavaScript with error handling
- **Caching**: Client-side caching for improved performance

## 🔧 Setup Instructions

### Enable GitHub Pages
1. Go to your repository settings
2. Navigate to "Pages" section
3. Select "Deploy from a branch" as source
4. Choose "main" branch and "/ (root)" folder
5. Click "Save"

### Configure GitHub Actions
The repository already includes a GitHub Action that:
- Runs every hour
- Fetches weather data from Hong Kong Observatory
- Updates consolidated JSON files for Pages
- Commits and pushes updates automatically

## 🎯 Features Overview

- ✅ Real-time weather data display
- ✅ Multi-location temperature readings
- ✅ Rainfall data visualization
- ✅ Weather warnings and alerts
- ✅ Lightning detection alerts
- ✅ Responsive mobile-friendly design
- ✅ Auto-refresh functionality
- ✅ Manual refresh capability
- ✅ Error handling and loading states
- ✅ GitHub Pages deployment ready

## 🔄 Data Update Cycle

```
GitHub Action (Hourly) → Weather API → Consolidated JSON Files → GitHub Pages → User Dashboard
```

## 🌐 Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📱 Mobile Support

The dashboard is fully responsive and works seamlessly on:
- Smartphones
- Tablets
- Desktop computers

## 🎨 Customization

You can customize the dashboard by:
- Modifying colors in the CSS
- Adding new weather data visualizations
- Changing the refresh interval
- Adding more weather stations

## 📈 Future Enhancements

- Historical weather data charts
- Weather forecast integration
- Interactive maps
- Data export functionality
- Multi-language support
