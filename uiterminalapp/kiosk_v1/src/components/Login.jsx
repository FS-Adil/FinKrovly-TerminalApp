import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useKeyboard } from '../context/KeyboardContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { showKeyboard } = useKeyboard();
  const navigate = useNavigate();

  const handleUsernameClick = () => {
    // Поле username всегда использует английскую раскладку
    showKeyboard(username, (e) => setUsername(e.target.value), 'text', 'username');
  };

  const handlePasswordClick = () => {
    // Поле password всегда использует английскую раскладку
    showKeyboard(password, (e) => setPassword(e.target.value), 'password', 'password');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/');
    } else {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className="login-container">
      <h2>Авторизация для Оператора</h2>
      <div style={{ 
        backgroundColor: '#e8f4fd', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        borderLeft: '4px solid #3498db'
      }}>
        <p style={{ margin: 0, color: '#2c3e50', fontSize: '14px' }}>
          <strong>Подсказка:</strong> Для ввода логина и пароля используйте английскую раскладку.
          Виртуальная клавиатура автоматически переключится на английский.
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Логин (английские буквы)</label>
          <input
            type="text"
            value={username}
            onClick={handleUsernameClick}
            readOnly
            className="input-with-keyboard keyboard-hint"
            placeholder="Нажмите для ввода логина"
            required
          />
          {/* <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Демо: user или operator
          </div> */}
        </div>
        <div className="form-group">
          <label>Пароль (английские буквы и цифры)</label>
          <input
            type="password"
            value={password}
            onClick={handlePasswordClick}
            readOnly
            className="input-with-keyboard keyboard-hint"
            placeholder="Нажмите для ввода пароля"
            required
          />
          {/* <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Демо: user123 или operator123
          </div> */}
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="login-btn">
          Войти
        </button>
      </form>
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        {/* <p>Демо доступы:</p> */}
        {/* <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '10px',
          alignItems: 'center'
        }}>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '10px 15px', 
            borderRadius: '8px',
            width: '100%',
            maxWidth: '250px'
          }}>
            <div><strong>user</strong> / <strong>user123</strong></div>
            <div style={{ fontSize: '12px', color: '#666' }}>– только просмотр</div>
          </div>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '10px 15px', 
            borderRadius: '8px',
            width: '100%',
            maxWidth: '250px'
          }}>
            <div><strong>operator</strong> / <strong>operator123</strong></div>
            <div style={{ fontSize: '12px', color: '#666' }}>– полный доступ</div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Login;