// src/components/Header.js
import React, {useState} from 'react';
import './Header.css';  // Optional: Add styles

const Header = ({ cities, onCitySelect }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); 

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <header className="header">
      {cities.map((city, index) => (
        <button key={index} className="city-button" onClick={() => onCitySelect(city)}>
          {city}
        </button>
      ))}
    </header>
  );
};

export default Header;