import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { KeyboardProvider } from './context/KeyboardContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Home from './components/Home';
import RollList from './components/RollList';
import MoveToWorkshop from './components/MoveToWorkshop';

import './App.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // if (!user) return null;
  if (!user) return (
    <div className="header">
      <div className="header-left">
        <button className="home-btn" onClick={() => navigate('/')}>
          Домой
        </button>
      </div>
      
      <div className="header-center">
        <h1>Система учёта рулонов</h1>
      </div>
      
      <div className="header-right">
        <div className="user-info">
          Пользователь
        </div>
        <button className="logout-btn" onClick={() => navigate('/login')}>
          Авторизация
        </button>
      </div>
    </div>
  );


  return (
    <div className="header">
      <div className="header-left">
        <button className="home-btn" onClick={() => navigate('/')}>
          Домой
        </button>
      </div>
      
      <div className="header-center">
        <h1>Система учёта рулонов</h1>
      </div>
      
      <div className="header-right">
        <div className="user-info">
          {user.username} ({user.role === 'operator' ? 'Оператор' : 'Пользователь'})
        </div>
        <button className="logout-btn" onClick={logout}>
          Выйти
        </button>
      </div>
    </div>
  );
};

function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="App">
        {<Header />}
        {/* {user && <Header />} */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            // <PrivateRoute>
              <Home />
            // </PrivateRoute>
          } />
          <Route path="/rolls" element={
            // <PrivateRoute>
              <RollList />
            // </PrivateRoute>
          } />
          <Route path="/move" element={
            <PrivateRoute requiredRole="operator">
              <MoveToWorkshop />
            </PrivateRoute>
          } />
          {/* <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} /> */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <KeyboardProvider>
        <AppContent />
      </KeyboardProvider>
    </AuthProvider>
  );
}

export default App;