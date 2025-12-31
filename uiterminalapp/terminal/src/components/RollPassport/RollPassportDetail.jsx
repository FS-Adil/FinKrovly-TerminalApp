import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import passportService from '../../services/passportService';
import './RollPassport.css';

const RollPassportDetail = ({ isAdmin }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printMode, setPrintMode] = useState(false);

  useEffect(() => {
    fetchPassport();
  }, [id]);

  const fetchPassport = async () => {
    try {
      setLoading(true);
      const data = await passportService.getPassportById(id);
      setPassport(data);
    } catch (error) {
      console.error('Ошибка при загрузке паспорта:', error);
      alert('Не удалось загрузить паспорт');
      navigate('/passports');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот паспорт?')) {
      return;
    }

    try {
      await passportService.deletePassport(id);
      alert('Паспорт удален');
      navigate('/passports');
    } catch (error) {
      console.error('Ошибка при удалении паспорта:', error);
      alert('Не удалось удалить паспорт');
    }
  };

  const handleArchive = async () => {
    if (!window.confirm('Архивировать этот паспорт?')) {
      return;
    }

    try {
      await passportService.archivePassport(id);
      alert('Паспорт архивирован');
      fetchPassport(); // Обновляем данные
    } catch (error) {
      console.error('Ошибка при архивации паспорта:', error);
      alert('Не удалось архивировать паспорт');
    }
  };

  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 100);
  };

  if (loading) {
    return (
      <div className="passport-detail-page">
        <div className="loading">Загрузка паспорта...</div>
      </div>
    );
  }

  if (!passport) {
    return (
      <div className="passport-detail-page">
        <div className="error">Паспорт не найден</div>
      </div>
    );
  }

  const passportData = passportService.generatePassportData(passport);

  return (
    <div className={`passport-detail-page ${printMode ? 'print-mode' : ''}`}>
      <div className="detail-header">
        <Link to="/passports" className="back-link">
          ← Назад к списку
        </Link>
        
        <div className="detail-actions">
          <button onClick={handlePrint} className="print-btn">
            🖨️ Печать
          </button>
          
          {isAdmin && (
            <>
              {passport.status === 'active' && (
                <button onClick={handleArchive} className="archive-btn">
                  📁 Архивировать
                </button>
              )}
              <button onClick={handleDelete} className="delete-btn">
                🗑️ Удалить
              </button>
            </>
          )}
        </div>
      </div>

      <div className="passport-document">
        <div className="document-header">
          <div className="company-info">
            <h2>ООО "Производственная Компания"</h2>
            <p>Система управления производством</p>
          </div>
          <div className="document-title">
            <h1>{passportData.header}</h1>
            <p className="document-subtitle">
              Документ № {passportData.number}
            </p>
          </div>
          <div className="document-qr">
            <img 
              src={passportData.qrCodeUrl} 
              alt="QR код" 
              className="document-qr-code"
            />
          </div>
        </div>

        <div className="document-body">
          <div className="main-info">
            <h3>Основная информация</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Номер рулона:</span>
                <span className="info-value">{passportData.number}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Материал:</span>
                <span className="info-value">{passportData.material}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Общий вес:</span>
                <span className="info-value">{passportData.totalWeight}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Текущее место:</span>
                <span className="info-value">{passportData.currentLocation}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Статус:</span>
                <span className={`info-value status-${passport.status}`}>
                  {passportData.status}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Дата создания:</span>
                <span className="info-value">{passportData.createdAt}</span>
              </div>
            </div>
          </div>

          <div className="movement-stats">
            <h3>Статистика перемещений</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{passport.movementsCount}</div>
                <div className="stat-label">Всего перемещений</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{passportData.totalMovedWeight}</div>
                <div className="stat-label">Общий перемещенный вес</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{passportData.lastMovement}</div>
                <div className="stat-label">Последнее перемещение</div>
              </div>
            </div>
          </div>

          {passport.movements && passport.movements.length > 0 && (
            <div className="movement-history">
              <h3>История перемещений</h3>
              <div className="history-table-container">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Откуда</th>
                      <th>Куда</th>
                      <th>Вес (кг)</th>
                      <th>Ответственный</th>
                    </tr>
                  </thead>
                  <tbody>
                    {passport.movements.map(movement => (
                      <tr key={movement.id}>
                        <td>{new Date(movement.date).toLocaleString('ru-RU')}</td>
                        <td>{movement.fromLocation}</td>
                        <td>{movement.toWorkshop}</td>
                        <td>{movement.quantity}</td>
                        <td>{movement.responsible}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="document-footer">
            <div className="notes-section">
              <h4>Примечания:</h4>
              <p>{passport.notes || 'Нет примечаний'}</p>
            </div>
            
            <div className="signatures">
              <div className="signature">
                <div className="signature-line"></div>
                <p>Ответственный за выдачу</p>
              </div>
              <div className="signature">
                <div className="signature-line"></div>
                <p>Ответственный за приемку</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RollPassportDetail;