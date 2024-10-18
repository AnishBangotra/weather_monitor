// src/components/CityWeather.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import sunrise from '../images/sunrise.png';
import sunset from '../images/sunset.png';
import '../index.css'

const API_KEY = '32e7b1761f3c4fac0ab1d541ccf72250'; 

const WeatherAPI_KEY = '3cde3d6f2094461fb11213637241710';

const kelvinToCelsius = (kelvin) => (kelvin - 273.15).toFixed(2);

const POLLING_INTERVAL = 300000
const ALERT_CHECK_INTERVAL = 60000

const CityWeather = ({ selectedCity }) => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [temp, setTemp] = useState(null);
  const [alertMessages, setAlertMessages] = useState([]);
  const [alertConfig, setAlertConfig] = useState({ thresholdTemp: 35, consecutiveAlerts: 2 });
  const [alertCounts, setAlertCounts] = useState({}); 
  const [unit, setUnit] = useState('C');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${selectedCity}&appid=${API_KEY}`
        );

        const baseUrl = 'https://api.weatherapi.com/v1/forecast.json';
        const forecastResponse = await axios.get(baseUrl, {
          params: {
            key: WeatherAPI_KEY,
            q: selectedCity,             
            days: 7,         
          },
        });
        
        const forecastData = forecastResponse?.data?.forecast?.forecastday || [];
        const data = response.data;
        setWeather({
          city: selectedCity,
          weather: data.weather[0].main,
          temperature: data.main.temp,
          max_temp: data.main.temp_max,
          min_temp: data.main.temp_min,
          wind: data.wind.speed,
          pressure: data.main.pressure,
          humidity: data.main.humidity,
          icon: data.weather[0].icon,
          feels_like: data.main.feels_like,
          timestamp: new Date(data.dt * 1000).toLocaleString(),
        });
        setTemp(data.main.temp)
        setForecast(forecastData)

      } catch (err) {
        setError('Failed to fetch weather data. Please try again in a moment.');
      } finally {
        setLoading(false);
      }
    };

    if (selectedCity) fetchWeatherData();

    const intervalId = setInterval(fetchWeatherData, POLLING_INTERVAL);
    const startAlertCheckTimeout = setTimeout(() => {
        const alertInterval = setInterval(checkForAlerts(selectedCity, kelvinToCelsius(temp)), ALERT_CHECK_INTERVAL); // 1-minute alert check
  
        // Cleanup alert interval on unmount
        return () => {
            clearInterval(alertInterval);
        }
      }, ALERT_CHECK_INTERVAL);

    return () => {
        clearInterval(intervalId);
        clearTimeout(startAlertCheckTimeout);
    }

  }, [selectedCity, alertCounts]);

  const convertTemperature = (tempInKelvin) => {
    if (typeof tempInKelvin !== 'number') {
        return 'N/A';
      }
      return unit === 'C' ? kelvinToCelsius(tempInKelvin) : tempInKelvin.toFixed(2);
  };

  const generateWeatherSummary = (condition) => {
    const summaries = {
      Clear: `The sky is completely clear with no clouds. 🌞 
      Expect a lot of sunshine throughout the day. Temperatures may rise, especially during midday. 
      It's a great time for outdoor activities, but remember to wear sunscreen, sunglasses, and stay hydrated.`,

    Clouds: `The sky is covered with clouds, reducing sunlight. ☁️ 
      The temperature may remain moderate or slightly cooler than usual. 
      While it feels comfortable, keep an eye out for any changes since cloud cover can sometimes indicate incoming rain.`,

    Rain: `Rain showers are expected. 🌧️ 
      Roads might become slippery, and puddles or waterlogging could occur in low-lying areas. 
      Be cautious while driving and carry an umbrella or raincoat. Prolonged rain might lead to flooding in some regions.`,

    Drizzle: `Light rain or drizzle is falling intermittently. 🌦️ 
      Though it’s not a heavy downpour, roads and surfaces could still become slick. 
      A small umbrella or light rain jacket is recommended if you're heading outdoors.`,

    Mist: `The environment is covered with a light mist, reducing visibility. 🌫️ 
      Mist often forms early in the morning or late at night. It’s advised to drive slowly and keep your headlights on low beam for safety.`,

    Haze: `The air appears hazy due to fine dust or pollution. 🌁 
      Visibility might be affected, and breathing could be difficult, especially for people with respiratory issues. 
      It's recommended to wear a mask outdoors and stay indoors if possible. Keep track of air quality levels.`,

    Thunderstorm: `A thunderstorm is approaching, bringing lightning, thunder, and heavy rain. ⛈️ 
      Stay indoors and unplug electronic devices to prevent damage. Avoid standing under trees or near windows, and postpone outdoor activities.`,

    Snow: `Snowfall is occurring or expected. ❄️ 
      Roads and sidewalks may become slippery, and visibility might be limited. 
      Wear warm clothing, use winter tires for your vehicle, and monitor weather alerts for snow accumulation.`,

    Fog: `Dense fog is present, significantly reducing visibility. 🌫️ 
      It’s advised to drive slowly, use fog lights, and maintain a safe distance from other vehicles. 
      Expect delays if you are traveling, and try to avoid driving if possible.`,

    Smoke: `Smoke is present in the air, often from wildfires or pollution. 🔥 
      Air quality may be poor, posing risks to health, especially for those with respiratory conditions. 
      Stay indoors, use air purifiers, and wear masks if you need to go outside.`,

    Dust: `Dust storms or dusty conditions are present. 🏜️ 
      Visibility may be low, and the air might irritate your eyes and respiratory system. 
      Wear protective goggles and masks, and avoid outdoor activities if possible.`,

    Ash: `Volcanic ash is present in the atmosphere. 🌋 
      It’s essential to stay indoors and close windows to prevent ash from entering your home. 
      Wear masks and protective clothing if you need to be outdoors, and monitor local advisories.`,

    Squall: `A sudden, intense burst of wind with rain is likely. 💨 
      Squalls can cause temporary but dangerous conditions, such as falling objects or tree branches. 
      Secure outdoor belongings, and avoid unnecessary travel until the squall passes.`,

    Tornado: `A tornado or funnel cloud is forming. 🌪️ 
      Seek shelter immediately in a basement or a small, windowless room on the lowest floor. 
      Avoid staying near windows, and stay updated on alerts from local weather services.`,
    };
  
    return summaries[condition] || "No specific summary available.";
  };
   

  const checkForAlerts = (city, temperature) => {
    const { thresholdTemp, consecutiveAlerts } = alertConfig;
    if (temperature > thresholdTemp) {
          // Increment alert count if threshold is breached
        setAlertCounts((prevCounts) => ({
        ...prevCounts,
            [city]: (prevCounts[city] || 0) + 1,
        }));
    } else {
        // Reset count if temperature drops below threshold
        setAlertCounts((prevCounts) => ({ ...prevCounts, [city]: 0 }));
    }
    // Trigger alert if the threshold is breached for consecutive updates
    if (alertCounts[city] >= consecutiveAlerts - 1) {
        triggerAlert(city, temperature, consecutiveAlerts);
    }
  };

  const triggerAlert = (city, temperature, consecutiveAlerts) => {
    const alertMessage = `* Temperature in ${city} has exceeded the threshold of ${alertConfig.thresholdTemp}°C for ${consecutiveAlerts} consecutive updates. Current temperature: ${temperature}°C`
    console.log(alertMessage);
    setAlertMessages((prevMessages) => [...prevMessages.slice(0, 4), alertMessage].reverse());
    // alert(`ALERT: Temperature in ${city} has exceeded the threshold of ${alertConfig.thresholdTemp}°C for two consecutive updates. Current temperature: ${kelvinToCelsius(temperature)}°C`)
  };

  if (loading) return <p style={{fontSize: '35px', fontFamily: 'monospace'}}>Loading data...</p>;
  if (error) return <p style={{ color: 'red', fontSize: '35px', fontFamily: 'monospace' }}>{error}</p>;

  return (
    weather && (
      <div className='container'>
        <div className="weather-containers">
        <div className='weather-details'>
            <h2>{weather.city}</h2>
            <img
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            alt={`${weather.weather} icon`} 
            />
            <div className="temperature-display">
            <p style={{fontSize: '80px', color: '#071a88'}}>
                {convertTemperature(weather.temperature)} °{unit}
            </p>
            <div className="temperature-conversion">
                <button onClick={() => setUnit('C')}>Celsius</button>
                <button onClick={() => setUnit('K')}>Kelvin</button>
            </div>
            </div>
            <p style={{color: '#21b483'}}>{weather.weather}</p>
            <p style={{color: '#071a88'}}>Feels Like | {convertTemperature(weather.feels_like)} °{unit}</p>
            <p style={{fontSize: '30px', marginTop: '40px', fontFamily: 'revert-layer'}}><strong>Last Updated | </strong> {weather.timestamp}</p>
        </div>
        <div className="alert-config">
            <h3>Configuration</h3>
            <label>
            Threshold Temperature (°C):
            <input
                type="number"
                value={alertConfig.thresholdTemp}
                onChange={(e) =>
                setAlertConfig({ ...alertConfig, thresholdTemp: e.target.value })
                }
            />
            </label>
            <label>
            Consecutive Alerts:
            <input
                type="number"
                value={alertConfig.consecutiveAlerts}
                onChange={(e) =>
                setAlertConfig({ ...alertConfig, consecutiveAlerts: e.target.value })
                }
            />
            </label>
            <div className="alert-messages">
                {/* <h4>Alerts</h4> */}
                {alertMessages.length > 0 ? (
                    <ul>
                    {alertMessages.map((message, index) => (
                        <li key={index}>{message}</li>
                    ))}
                    </ul>
                ) : (
                    <p style={{color:'#071a88', fontSize: '16px', marginTop: '60px', textAlign: 'center', fontFamily: 'monospace'}}>No alerts triggered yet.</p>
                )}
            </div>
        </div>
      </div>
      <div style={{marginTop: '60px'}} />
      <div className='forecast-container'>
          <h2>Daily Weather Forecast</h2>
          {forecast.map((row, index) => (
            <>
            <div key={row.date} className="forecast-day">
              <h4>{row.date}</h4>
              <img src={row.day.condition.icon} alt={row.day.condition.text} />
              <div className="sun-times">
                <img src={sunrise} alt="Sunrise" className="icon-small" />
                <p>{row.astro.sunrise}</p>
              </div>
              <div className='sun-times'>
                <img src={sunset} alt="Sunset" className="icon-small" />
                <p>{row.astro.sunset}</p>
              </div>
              <p><strong>Avg Temp:</strong> {row.day.avgtemp_c} °C</p>
              <p><strong>Min Temp:</strong> {row.day.mintemp_c} °C</p>
              <p><strong>Max Temp:</strong> {row.day.maxtemp_c} °C</p>
            </div>
            </>
          ))}
      </div>
      <div style={{marginTop: '80px'}} />
      <div className='summary'>
         <h2>Weather Summary</h2>
         <p>
         {generateWeatherSummary(
            weather.weather
          )}
         </p>
         <div className='bottom-details'>
            <div className='column-box'>
              <p>{kelvinToCelsius(weather.max_temp)}°C</p>
              <h3>Max Temp</h3>
            </div>
            <div className='column-box'>
              <p>{kelvinToCelsius(weather.min_temp)}°C</p>
              <h3>Min Temp</h3>
            </div>
            <div className='column-box'>
              <p>{weather.wind}m/s</p>
              <h3>Wind Speed</h3>
            </div>
            <div className='column-box'>
              <p>{weather.humidity}%</p>
              <h3>Humidity</h3>
            </div>
            <div className='column-box'>
              <p>{weather.pressure}kPa</p>
              <h3>Air Pressure</h3>
            </div>
         </div> 
        </div>
      </div>
      
    )
  );
};

export default CityWeather;
