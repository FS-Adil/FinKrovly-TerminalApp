// import { useState } from 'react'
// import Video from './old_components/Video/Video'
// import { VIDEOS } from './videos'
// import './App.css'
// import HomeButton from './old_components/HomeButton/HomeButton'
// import HomePage from './old_components/HomePage/HomePage'
// import RollMovementPage from './old_components/RollMovementPage/RollMovementPage'
// import RollsPage from './old_components/RollsPage/RollsPage'
// import HistoryPage from './old_components/HistoryPage/HistoryPage'
// import StatsPage from './old_components/StatsPage/StatsPage'

// import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

// function App() {

//   return (
//     <>
//     <Router>
//       <div className="App">
//       {/* <div className='video-container'>
//         {
//           VIDEOS.map((video) => (
//             <Video 
//               key={video.id}
//               title={video.title} 
//               videoName={video.videoName} 
//               img={video.img} />
//           ))
//         }
//       </div> */}
      
//         <HomeButton/>
//         <Routes>
//           <Route path="/" element={<HomePage />} />
//           <Route path="/roll-movement" element={<RollMovementPage />} />
//           <Route path="/rolls" element={<RollsPage />} />
//           <Route path="/history" element={<HistoryPage />} />
//           <Route path="/stats" element={<StatsPage />} />
//         </Routes>
//         </div>
//       </Router>
//     </>
//   )
// }

// export default App

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HomeButton from './components/HomeButton/HomeButton';
import HomePage from './components/HomePage/HomePage';
import RollMovementPage from './components/RollMovementPage/RollMovementPage';
import RollsPage from './components/RollsPage/RollsPage';
import HistoryPage from './components/HistoryPage/HistoryPage';
import StatsPage from './components/StatsPage/StatsPage';
import AuthButton from './components/AuthButton/AuthButton';

// В импорты добавляем:
import RollPassportPage from './components/RollPassport/RollPassportPage';
import RollPassportDetail from './components/RollPassport/RollPassportDetail';

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const isAuthenticated = !!user;

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Восстановление сессии при загрузке
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <HomeButton />
        <ConditionalAuthButton 
          isAuthenticated={isAuthenticated}
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/roll-movement" 
            element={
              <RollMovementPage 
                isAdmin={user?.role === 'admin'} 
              />
            } 
          />
          <Route 
            path="/rolls" 
            element={
              <RollsPage 
                isAdmin={user?.role === 'admin'} 
              />
            } 
          />
          <Route 
            path="/history" 
            element={
              <HistoryPage 
                isAdmin={user?.role === 'admin'}
                onRefresh={() => window.location.reload()}
              />
            } 
          />
          <Route path="/stats" element={<StatsPage />} />

          {/* Новые маршруты для паспортов */}
          <Route path="/passports" element={<RollPassportPage isAdmin={user?.role === 'admin'} />} />
          <Route path="/passports/:id" element={<RollPassportDetail isAdmin={user?.role === 'admin'} />} />

        </Routes>
      </div>
    </Router>
  );
}

// Компонент для условного отображения кнопки авторизации
const ConditionalAuthButton = ({ isAuthenticated, user, onLogin, onLogout }) => {
  const location = useLocation();
  
  // Показываем только на главной странице
  if (location.pathname !== '/') return null;
  
  return (
    <AuthButton 
      isAuthenticated={isAuthenticated}
      user={user}
      onLogin={onLogin}
      onLogout={onLogout}
    />
  );
};

export default App;