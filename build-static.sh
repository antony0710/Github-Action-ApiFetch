#!/bin/bash

# Build React application
echo "Building React application..."
npm run build

# Copy weather data and forecast data to build directory
echo "Copying weather data..."
cp -r weather_data build/
cp -r NineDayForecast build/

# Copy any standalone weather files
cp weather_*.json build/ 2>/dev/null || true

echo "Build complete! Static files are in the 'build' directory."