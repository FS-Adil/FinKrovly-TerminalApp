import React, { useState, useEffect } from 'react';
import api, { deleteMovement, returnRollToAvailable } from '../../services/api';
import './HistoryPage.css';

const HistoryPage = ({ isAdmin, onRefresh }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Функция загрузки истории
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/movements/history');
      setHistory(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке истории:', error);
      alert('Не удалось загрузить историю перемещений');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // УДАЛЕНИЕ ПЕРЕМЕЩЕНИЯ
  const handleDeleteMovement = async (movementId) => {
    if (!isAdmin) {
      alert('Только администратор может удалять перемещения');
      return;
    }

    if (!window.confirm('Вы уверены, что хотите удалить это перемещение?')) {
      return;
    }

    try {
      setDeletingId(movementId);
      
      // ✅ РЕАЛЬНЫЙ DELETE запрос
      await deleteMovement(movementId);
      
      // Обновляем список после успешного удаления
      await fetchHistory();
      
      alert('Перемещение удалено, рулон возвращен в список доступных');
      
      // Уведомляем родительский компонент об обновлении
      if (onRefresh) {
        onRefresh();
      }
      
    } catch (error) {
      console.error('Ошибка при удалении:', error);
      
      // Пользовательские сообщения об ошибках
      if (error.response?.status === 404) {
        alert('Перемещение не найдено');
      } else if (error.response?.status === 403) {
        alert('У вас недостаточно прав для удаления');
      } else {
        alert('Не удалось удалить перемещение');
      }
    } finally {
      setDeletingId(null);
    }
  };

  // ВОЗВРАТ РУЛОНА
  const handleReturnRoll = async (movement) => {
    if (!isAdmin) {
      alert('Только администратор может возвращать рулоны');
      return;
    }

    if (!window.confirm(`Вернуть рулон ${movement.rollNumber} в список доступных?`)) {
      return;
    }

    try {
      // ✅ РЕАЛЬНЫЙ POST запрос
      const response = await returnRollToAvailable(movement.id);
      
      // Используем сообщение с сервера
      alert(response.data.message);
      
      // Обновляем данные
      await fetchHistory();
      
      if (onRefresh) {
        onRefresh();
      }
      
    } catch (error) {
      console.error('Ошибка при возврате рулона:', error);
      
      if (error.response?.data?.error) {
        alert(`Ошибка: ${error.response.data.error}`);
      } else {
        alert('Не удалось вернуть рулон');
      }
    }
  };

  return (
    <div className="history-page">
      <h2>История перемещений</h2>
      
      {isAdmin && (
        <div className="admin-notice">
          🔧 Режим администратора: доступно удаление перемещений и возврат рулонов
        </div>
      )}
      
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
                {isAdmin && <th>Действия</th>}
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
                  {isAdmin && (
                    <td>
                      <div className="admin-actions">
                        <button
                          onClick={() => handleDeleteMovement(item.id)}
                          disabled={deletingId === item.id}
                          className="delete-btn"
                          title="Удалить перемещение"
                        >
                          {deletingId === item.id ? '⏳' : '🗑️'}
                        </button>
                        <button
                          onClick={() => handleReturnRoll(item)}
                          className="return-btn"
                          title="Вернуть рулон"
                        >
                          ↩️
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && (
            <div className="no-results">История перемещений пуста</div>
          )}
        </div>
      )}
      
      <div className="page-actions">
        <button onClick={fetchHistory} className="refresh-btn">
          ↻ Обновить историю
        </button>
      </div>
    </div>
  );
};

export default HistoryPage;