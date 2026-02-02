import { useState } from 'react';
import './HomePage.css';

import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

function HomePage() {
    return (
    <div className="home-page">
      <h1>Система управления производством</h1>
      <div className="main-menu">
        <Link to="/roll-movement">
          <button className="main-action-btn">
            📦 Формирование Перемещения рулона в цех
          </button>
        </Link>
        
        <div className="additional-actions">
          <Link to="/rolls">
            <button className="secondary-btn">📋 Список рулонов</button>
          </Link>
          <Link to="/history">
            <button className="secondary-btn">📊 История перемещений</button>
          </Link>
          <Link to="/stats">
            <button className="secondary-btn">📈 Статистика</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;