import React, { useState } from 'react';
import { login, logout } from '../../services/api';
import './AuthButton.css';

const AuthButton = ({ onLogin, onLogout, isAuthenticated, user }) => {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Заполните все поля');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await login(username, password);
      
      if (result.success) {
        onLogin(result.user);
        setShowLoginForm(false);
        setUsername('');
        setPassword('');
      } else {
        setError(result.error || 'Ошибка входа');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'Неверные учетные данные');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onLogout();
    setShowLoginForm(false);
  };

  if (isAuthenticated) {
    return (
      <div className="auth-button">
        <div className="user-info">
          <span className="username">{user.username}</span>
          <span className={`role role-${user.role}`}>
            {user.role === 'admin' ? '👑 Админ' : '👷 Оператор'}
          </span>
          <button onClick={handleLogout} className="logout-btn">Выйти</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-button">
      {!showLoginForm ? (
        <button onClick={() => setShowLoginForm(true)} className="login-btn">
          🔐 Войти
        </button>
      ) : (
        <div className="login-form">
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Логин"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            {error && <div className="error">{error}</div>}
            <div className="form-buttons">
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Вход...' : 'Войти'}
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setShowLoginForm(false);
                  setError('');
                }}
                disabled={loading}
              >
                Отмена
              </button>
            </div>
          </form>
          <div className="hint">
            Тестовые данные:<br/>
            👑 Админ: admin / admin123<br/>
            👷 Оператор: operator / operator123
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthButton;