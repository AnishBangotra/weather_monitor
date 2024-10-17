// src/App.js
import React, { useState } from 'react';
import Header from './components/Header';
import CityWeather from './components/CityWeather';
import './index.css';  // Import global styles

const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];

function App() {
  const [selectedCity, setSelectedCity] = useState('Delhi');

  return (
    <div className="App">
      <Header cities={cities} onCitySelect={setSelectedCity} />
      <main className="content">
        {selectedCity ? (
          <CityWeather selectedCity={selectedCity} />
        ) : (
          <>
            <p style={{
              fontSize: '50px',
              fontWeight: 'bold',
              fontFamily: 'SourceSans',
            }}>Real time Weather Monitoring of Metro cities
            <p style={{ textAlign: 'left'}}>With OpenWeather API</p>
            </p>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
