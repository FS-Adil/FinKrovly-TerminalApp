import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
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
          {/* Новая кнопка */}
        <Link to="/passports">
            <button className="secondary-btn">📋 Паспорта рулонов</button>
        </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;