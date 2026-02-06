import React, { useState, useEffect } from 'react';
import RollPassportCard from './RollPassportCard';
import passportService from '../../services/passportService';
import './RollPassport.css';

const RollPassportPage = ({ isAdmin }) => {
  const [passports, setPassports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchPassports();
  }, []);

  const fetchPassports = async () => {
    try {
      setLoading(true);
      const data = await passportService.getAllPassports(searchTerm);
      setPassports(data);
    } catch (error) {
      console.error('Ошибка при загрузке паспортов:', error);
      alert('Не удалось загрузить паспорты');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (passportId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот паспорт?')) {
      return;
    }

    try {
      setDeletingId(passportId);
      await passportService.deletePassport(passportId);
      await fetchPassports(); // Обновляем список
      alert('Паспорт удален');
    } catch (error) {
      console.error('Ошибка при удалении паспорта:', error);
      alert('Не удалось удалить паспорт');
    } finally {
      setDeletingId(null);
    }
  };

  const handleArchive = async (passportId) => {
    if (!window.confirm('Архивировать этот паспорт?')) {
      return;
    }

    try {
      await passportService.archivePassport(passportId);
      await fetchPassports(); // Обновляем список
      alert('Паспорт архивирован');
    } catch (error) {
      console.error('Ошибка при архивации паспорта:', error);
      alert('Не удалось архивировать паспорт');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPassports();
  };

  const handleStatusFilter = (status) => {
    setFilterStatus(status);
  };

  // Фильтрация паспортов по статусу
  const filteredPassports = filterStatus === 'all' 
    ? passports 
    : passports.filter(p => p.status === filterStatus);

  return (
    <div className="passport-page">
      <div className="page-header">
        <h1>📋 Паспорта рулонов</h1>
        <p className="page-subtitle">
          Автоматически созданные документы для каждого рулона
        </p>
      </div>

      {isAdmin && (
        <div className="admin-notice">
          🔧 Режим администратора: доступно удаление и архивация паспортов
        </div>
      )}

      <div className="passport-controls">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-container">
            <input
              type="text"
              placeholder="Поиск по номеру рулона, материалу или месту..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              🔍
            </button>
          </div>
        </form>

        <div className="filter-controls">
          <div className="filter-buttons">
            <button
              onClick={() => handleStatusFilter('all')}
              className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            >
              Все
            </button>
            <button
              onClick={() => handleStatusFilter('active')}
              className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
            >
              Активные
            </button>
            <button
              onClick={() => handleStatusFilter('archived')}
              className={`filter-btn ${filterStatus === 'archived' ? 'active' : ''}`}
            >
              Архивные
            </button>
          </div>

          <button onClick={fetchPassports} className="refresh-btn">
            ↻ Обновить
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Загрузка паспортов...</div>
      ) : (
        <>
          <div className="passport-stats">
            <div className="stat-item">
              <span className="stat-value">{passports.length}</span>
              <span className="stat-label">Всего паспортов</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {passports.filter(p => p.status === 'active').length}
              </span>
              <span className="stat-label">Активных</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {passports.reduce((sum, p) => sum + p.movementsCount, 0)}
              </span>
              <span className="stat-label">Всего перемещений</span>
            </div>
          </div>

          {filteredPassports.length === 0 ? (
            <div className="no-results">
              {searchTerm ? 'По вашему запросу ничего не найдено' : 'Паспортов еще нет'}
            </div>
          ) : (
            <div className="passport-grid">
              {filteredPassports.map(passport => (
                <RollPassportCard
                  key={passport.id}
                  passport={passport}
                  isAdmin={isAdmin}
                  onDelete={handleDelete}
                  onArchive={handleArchive}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RollPassportPage;