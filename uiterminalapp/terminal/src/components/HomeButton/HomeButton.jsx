import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './HomeButton.css';

const HomeButton = () => {
  const location = useLocation();
  
  if (location.pathname === '/') return null;
  
  return (
    <div className="home-button">
      <Link to="/">
        <button className="home-btn">🏠 На главную</button>
      </Link>
    </div>
  );
};

export default HomeButton;