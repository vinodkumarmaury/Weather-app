import React, { useEffect, useState } from 'react';
// import axios from 'axios';

function WeatherCard({ city }) {
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const API_KEY = 'YOUR_API_KEY'; // Replace with your weatherapi.com API key
      const url = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city.name}`;
    //   const response = await axios.get(url);
    //   setWeatherData(response.data);
    };

    fetchData();
  }, [city.name]);

  if (!weatherData) {
    return <div>Loading weather data...</div>;
  }

  const { temp_c, humidity, wind_kph, condition } = weatherData.current;

  return (
    <div className="weather-card">
      <h3>{city.name}</h3>
      <p>Temperature: {temp_c}°C</p>
      <p>Humidity: {humidity}%</p>
      <p>Wind Speed: {wind_kph} kph</p>
      <p>{condition.text}</p>
      <img src={condition.icon} alt={condition.text} />
    </div>
  );
}

export default WeatherCard;