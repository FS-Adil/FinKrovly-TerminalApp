import React, { useState, useEffect } from 'react';

import axios from 'axios';

// Страница истории перемещений
function HistoryPage() {

  const api = axios.create({
    baseURL: 'http://localhost:3001/api', // ← вот этот URL
    timeout: 10000,
  });

 const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/movements/history');
      setHistory(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке истории:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="history-page">
      <h2>История перемещений</h2>
      
      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : (
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Номер рулона</th>
                <th>Откуда</th>
                <th>Куда</th>
                <th>Вес (кг)</th>
                <th>Ответственный</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.date || item.timestamp).toLocaleString('ru-RU')}</td>
                  <td>{item.rollNumber}</td>
                  <td>{item.fromLocation || item.from}</td>
                  <td>{item.toWorkshop || item.to}</td>
                  <td>{item.quantity || item.weight}</td>
                  <td>{item.responsible}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <button onClick={fetchHistory} className="refresh-btn">
        ↻ Обновить историю
      </button>
    </div>
  );
};

export default HistoryPage;