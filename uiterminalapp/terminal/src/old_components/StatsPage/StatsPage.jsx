import React, { useState, useEffect } from 'react';

import './StatsPage.css';

import axios from 'axios';

  // Страница статистики
function StatsPage() {

  const api = axios.create({
    baseURL: 'http://localhost:3001/api', // ← вот этот URL
    timeout: 10000,
  });

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stats-page">
      <h2>Статистика системы</h2>
      
      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : stats ? (
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-value">{stats.totalRolls}</div>
            <div className="stat-label">Всего рулонов</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.availableRolls}</div>
            <div className="stat-label">Доступно для перемещения</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalWeight} кг</div>
            <div className="stat-label">Общий вес</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalMovements}</div>
            <div className="stat-label">Всего перемещений</div>
          </div>
        </div>
      ) : (
        <div className="error">Не удалось загрузить статистику</div>
      )}
      
      <button onClick={fetchStats} className="refresh-btn">
        ↻ Обновить статистику
      </button>
    </div>
  );
};




export default StatsPage;