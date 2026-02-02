import './HomeButton.css';

import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

function HomeButton() {
    const location = useLocation();
  
//   Не показываем кнопку на главной странице
  if (location.pathname === '/') return null;
  
  return (
    <div className="home-button">
      <Link to="/">
        <button className="home-btn">🏠 На главную</button>
      </Link>
    </div>
  )
}

export default HomeButton;