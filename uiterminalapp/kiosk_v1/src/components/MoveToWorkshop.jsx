import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useKeyboard } from '../context/KeyboardContext';
import { moveRoll } from '../services/api';

const mockRolls = [
  { id: 1, name: 'Рулон А', characteristic: 'Сталь 3мм', batch: 'BATCH001', quantity: 5 },
  { id: 2, name: 'Рулон B', characteristic: 'Алюминий 1.5мм', batch: 'BATCH002', quantity: 3 },
  { id: 3, name: 'Рулон C', characteristic: 'Медь 2мм', batch: 'BATCH003', quantity: 8 },
  { id: 4, name: 'Рулон D', characteristic: 'Сталь 5мм', batch: 'BATCH004', quantity: 2 },
  { id: 5, name: 'Рулон E', characteristic: 'Алюминий 3мм', batch: 'BATCH005', quantity: 6 },
];

const MoveToWorkshop = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showKeyboard } = useKeyboard();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoll, setSelectedRoll] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    characteristic: '',
    batch: '',
    quantity: '',
    workshop: 'Цех №1',
    reason: ''
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [apiResponse, setApiResponse] = useState('');

  useEffect(() => {
    if (location.state?.selectedRoll) {
      const roll = location.state.selectedRoll;
      setSelectedRoll(roll);
      setFormData({
        name: roll.name,
        characteristic: roll.characteristic,
        batch: roll.batch,
        quantity: roll.quantity,
        workshop: 'Цех №1',
        reason: ''
      });
    }
  }, [location]);

  const filteredRolls = mockRolls.filter(roll =>
    roll.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    roll.batch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRollSelect = (roll) => {
    setSelectedRoll(roll);
    setFormData(prev => ({
      ...prev,
      name: roll.name,
      characteristic: roll.characteristic,
      batch: roll.batch,
      quantity: roll.quantity
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInputClick = (fieldName, value, inputType = 'text', readOnly = false) => {
    if (readOnly) return;
    showKeyboard(value, (e) => handleChange(e), inputType, fieldName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await moveRoll(formData);
    setApiResponse(response.message);
    setModalOpen(true);
  };

  const handleSearchClick = () => {
    showKeyboard(searchTerm, (e) => setSearchTerm(e.target.value), 'text', 'searchTerm');
  };

  return (
    <div className="container">
        <div style={{ 
            marginBottom: '30px', 
            textAlign: 'center' 
        }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>Перемещение рулонов в цех №1</h2>
            <p style={{ color: '#666' }}>Выберите рулон для перемещения и заполните форму</p>
        </div>
      <div className="move-form">
        <h3>Перемещение рулонов в цех №1</h3>
        
        <div className="roll-search">
          <label>Поиск рулона в остатках:</label>
          <div style={{ 
            fontSize: '12px', 
            color: '#666', 
            marginBottom: '5px'
            }}>
                Подсказка: Можно использовать русскую или английскую раскладку
            </div>
          <input
            type="text"
            placeholder="Введите наименование или партию..."
            value={searchTerm}
            onClick={handleSearchClick}
            readOnly
            className="input-with-keyboard keyboard-hint"
          />
          {searchTerm && (
            <div style={{ marginTop: '10px', background: '#f8f9fa', padding: '10px', borderRadius: '5px' }}>
              {filteredRolls.map(roll => (
                <div 
                  key={roll.id} 
                  style={{ padding: '8px', borderBottom: '1px solid #ddd', cursor: 'pointer' }}
                  onClick={() => handleRollSelect(roll)}
                >
                  <strong>{roll.name}</strong> - {roll.characteristic} (Партия: {roll.batch}, Количество: {roll.quantity})
                </div>
              ))}
              {filteredRolls.length === 0 && <div>Рулоны не найдены</div>}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-fields">
            <div className="form-group">
              <label>Наименование</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onClick={() => handleInputClick('name', formData.name, 'text', !!selectedRoll)}
                readOnly={!!selectedRoll}
                className={`input-with-keyboard ${!selectedRoll ? 'keyboard-hint' : ''}`}
                placeholder={selectedRoll ? "" : "Нажмите для ввода"}
              />
            </div>
            <div className="form-group">
              <label>Характеристика</label>
              <input
                type="text"
                name="characteristic"
                value={formData.characteristic}
                onClick={() => handleInputClick('characteristic', formData.characteristic, 'text', !!selectedRoll)}
                readOnly={!!selectedRoll}
                className={`input-with-keyboard ${!selectedRoll ? 'keyboard-hint' : ''}`}
                placeholder={selectedRoll ? "" : "Нажмите для ввода"}
              />
            </div>
            <div className="form-group">
              <label>Партия</label>
              <input
                type="text"
                name="batch"
                value={formData.batch}
                onClick={() => handleInputClick('batch', formData.batch, 'text', !!selectedRoll)}
                readOnly={!!selectedRoll}
                className={`input-with-keyboard ${!selectedRoll ? 'keyboard-hint' : ''}`}
                placeholder={selectedRoll ? "" : "Нажмите для ввода"}
              />
            </div>
            <div className="form-group">
              <label>Количество</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onClick={() => handleInputClick('quantity', formData.quantity, 'number')}
                readOnly
                className="input-with-keyboard keyboard-hint"
                placeholder="Нажмите для ввода"
                min="1"
              />
            </div>
            <div className="form-group">
              <label>Цех назначения</label>
              <input
                type="text"
                name="workshop"
                value={formData.workshop}
                readOnly
              />
            </div>
            <div className="form-group">
              <label>Причина перемещения</label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onClick={() => handleInputClick('reason', formData.reason)}
                readOnly
                className="input-with-keyboard keyboard-hint"
                placeholder="Нажмите для ввода"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={user?.role !== 'operator'}
          >
            Переместить рулон
          </button>
        </form>
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Результат операции</h3>
            <p>{apiResponse}</p>
            <button className="close-btn" onClick={() => {
              setModalOpen(false);
              navigate('/');
            }}>
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoveToWorkshop;