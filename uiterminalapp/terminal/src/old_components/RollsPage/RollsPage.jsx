import React, { useState, useEffect } from 'react';
import './RollsPage.css'

import axios from 'axios';

// Страница списка рулонов
function RollsPage() {

  const api = axios.create({
    baseURL: 'http://localhost:3001/api', // ← вот этот URL
    timeout: 10000,
  });

  const [rolls, setRolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRolls();
  }, []);

  const fetchRolls = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rolls');
      setRolls(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке рулонов:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRolls = rolls.filter(roll =>
    roll.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    roll.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
    roll.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="rolls-page">
      <h2>Список рулонов на складе</h2>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Поиск по номеру, материалу или месту хранения..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <span className="search-icon">🔍</span>
      </div>

      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : (
        <div className="rolls-table-container">
          <table className="rolls-table">
            <thead>
              <tr>
                <th>Номер</th>
                <th>Материал</th>
                <th>Вес (кг)</th>
                <th>Доступно (кг)</th>
                <th>Место хранения</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {filteredRolls.map(roll => (
                <tr key={roll.id}>
                  <td>{roll.number}</td>
                  <td>{roll.material}</td>
                  <td>{roll.weight}</td>
                  <td>{roll.availableWeight}</td>
                  <td>{roll.location}</td>
                  <td>
                    <span className={`status-badge status-${roll.status}`}>
                      {roll.status === 'available' ? 'Доступен' : 'В перемещении'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRolls.length === 0 && (
            <div className="no-results">Рулоны не найдены</div>
          )}
        </div>
      )}

      <div className="page-actions">
        <button onClick={fetchRolls} className="refresh-btn">
          ↻ Обновить список
        </button>
      </div>
    </div>
  );
};


export default RollsPage;