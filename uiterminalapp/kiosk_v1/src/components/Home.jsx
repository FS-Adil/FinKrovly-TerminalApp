import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="home-container">
      <h2>Добро пожаловать в систему учёта рулонов</h2>
      <p style={{ fontSize: '18px', color: '#2c3e50', marginBottom: '40px' }}>
        Выберите нужный раздел для работы
      </p>
      <div className="button-grid">
        <button className="nav-btn" onClick={() => navigate('/rolls')}>
          <div style={{ fontSize: '20px', marginBottom: '10px' }}>📋</div>
          Список рулонов под краном
        </button>
        <button 
          className="nav-btn" 
          onClick={() => navigate('/move')}
          disabled={user?.role !== 'operator'}
          style={user?.role !== 'operator' ? { 
            opacity: 0.7, 
            cursor: 'not-allowed',
            position: 'relative'
          } : {}}
        >
          <div style={{ fontSize: '20px', marginBottom: '10px' }}>🏭</div>
          Перемещение рулонов в цех №1
          {user?.role !== 'operator' && (
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '0',
              right: '0',
              fontSize: '0.8rem',
              color: '#e74c3c',
              fontWeight: 'normal'
            }}>
              (только для оператора)
            </div>
          )}
        </button>
      </div>
      
      <div style={{ 
        marginTop: '50px', 
        padding: '20px', 
        background: '#f8f9fa', 
        borderRadius: '10px',
        maxWidth: '600px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>Краткая информация</h3>
        <div style={{ textAlign: 'left', lineHeight: '1.6' }}>
          <p><strong>Текущая роль:</strong> {user?.role === 'operator' ? 'Оператор' : 'Пользователь'}</p>
          <p><strong>Доступные действия:</strong></p>
          <ul style={{ paddingLeft: '20px', marginBottom: '0' }}>
            <li>Просмотр списка рулонов под краном</li>
            {user?.role === 'operator' && (
              <li>Перемещение рулонов в цех №1</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;