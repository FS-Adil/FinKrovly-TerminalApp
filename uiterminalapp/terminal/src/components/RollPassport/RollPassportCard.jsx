import React from 'react';
import { Link } from 'react-router-dom';
import passportService from '../../services/passportService';
import './RollPassport.css';

const RollPassportCard = ({ passport, isAdmin, onDelete, onArchive }) => {
  const passportData = passportService.generatePassportData(passport);
  
  return (
    <div className={`passport-card status-${passport.status}`}>
      <div className="passport-card-header">
        <div className="passport-title">
          <h3>{passportData.header}</h3>
          <span className="passport-number">{passportData.number}</span>
        </div>
        <div className="passport-status">
          <span className={`status-badge status-${passport.status}`}>
            {passportData.status}
          </span>
        </div>
      </div>
      
      <div className="passport-card-body">
        <div className="passport-info">
          <div className="info-row">
            <span className="info-label">Материал:</span>
            <span className="info-value">{passportData.material}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Общий вес:</span>
            <span className="info-value">{passportData.totalWeight}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Текущее место:</span>
            <span className="info-value">{passportData.currentLocation}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Перемещений:</span>
            <span className="info-value">{passport.movementsCount}</span>
          </div>
        </div>
        
        <div className="passport-qr">
          <img 
            src={passportData.qrCodeUrl} 
            alt="QR код паспорта" 
            className="qr-code"
          />
          <div className="qr-hint">Отсканируйте для быстрого доступа</div>
        </div>
      </div>
      
      <div className="passport-card-footer">
        <div className="passport-dates">
          <span>Создан: {passportData.createdAt}</span>
          {passport.lastMovementDate && (
            <span>Последнее перемещение: {passportData.lastMovement}</span>
          )}
        </div>
        
        <div className="passport-actions">
          <Link to={`/passports/${passport.id}`} className="view-btn">
            📄 Подробнее
          </Link>
          
          {isAdmin && (
            <>
              {passport.status === 'active' && (
                <button 
                  onClick={() => onArchive(passport.id)}
                  className="archive-btn"
                  title="Архивировать"
                >
                  📁
                </button>
              )}
              <button 
                onClick={() => onDelete(passport.id)}
                className="delete-btn"
                title="Удалить"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RollPassportCard;