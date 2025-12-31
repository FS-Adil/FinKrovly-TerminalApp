import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './RollMovementPage.css';

const RollMovementPage = () => {
  const [formData, setFormData] = useState({
    rollNumber: '',
    fromLocation: '',
    toWorkshop: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0],
    responsible: ''
  });

  const [rolls, setRolls] = useState([]);
  const [locations, setLocations] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedRoll, setSelectedRoll] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      setLoading(true);
      const [rollsRes, locationsRes, workshopsRes, employeesRes] = await Promise.all([
        api.get('/rolls/available'),
        api.get('/locations'),
        api.get('/workshops'),
        api.get('/employees')
      ]);

      setRolls(rollsRes.data);
      setLocations(locationsRes.data);
      setWorkshops(workshopsRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
      alert('Не удалось загрузить данные для формы');
    } finally {
      setLoading(false);
    }
  };

  const handleRollSearch = (searchTerm) => {
    setSearchTerm(searchTerm);
    if (searchTerm.length > 1) {
      const results = rolls.filter(roll =>
        roll.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        roll.material.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const handleSelectRoll = (roll) => {
    setSelectedRoll(roll);
    setFormData(prev => ({
      ...prev,
      rollNumber: roll.number,
      fromLocation: roll.location,
      quantity: roll.availableWeight
    }));
    setSearchTerm(roll.number);
    setShowSearchResults(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.rollNumber || !formData.fromLocation || !formData.toWorkshop || !formData.quantity || !formData.responsible) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    if (parseInt(formData.quantity) <= 0) {
      alert('Количество должно быть больше 0');
      return;
    }
    
    if (selectedRoll && parseInt(formData.quantity) > selectedRoll.availableWeight) {
      alert(`Недостаточно доступного веса. Максимум: ${selectedRoll.availableWeight} кг`);
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await api.post('/movements', formData);
      alert(response.data.message || 'Перемещение успешно оформлено!');
      
      // Сброс формы
      setFormData({
        rollNumber: '',
        fromLocation: '',
        toWorkshop: '',
        quantity: '',
        date: new Date().toISOString().split('T')[0],
        responsible: ''
      });
      setSearchTerm('');
      setSelectedRoll(null);
      
      // Обновляем данные
      fetchFormData();
    } catch (error) {
      console.error('Ошибка при оформлении перемещения:', error);
      alert(error.response?.data?.error || 'Не удалось оформить перемещение');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="roll-movement-page">
        <div className="loading">Загрузка данных...</div>
      </div>
    );
  }

  return (
    <div className="roll-movement-page">
      <h2>Формирование Перемещения рулона в цех</h2>
      
      <form onSubmit={handleSubmit} className="movement-form">
        <div className="form-group">
          <label>Поиск рулона: *</label>
          <div className="search-with-results">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleRollSearch(e.target.value)}
              placeholder="Введите номер рулона или материал..."
              className="roll-search-input"
              required
            />
            {showSearchResults && searchResults.length > 0 && (
              <div className="search-results-dropdown">
                {searchResults.map(roll => (
                  <div
                    key={roll.id}
                    className="search-result-item"
                    onClick={() => handleSelectRoll(roll)}
                  >
                    <div className="roll-number">{roll.number}</div>
                    <div className="roll-details">
                      <span>{roll.material}</span>
                      <span>{roll.availableWeight} кг</span>
                      <span>{roll.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="form-hint">Начните вводить номер или материал рулона</div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Номер рулона: *</label>
            <input
              type="text"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              required
              readOnly
              className="readonly-input"
            />
          </div>

          <div className="form-group">
            <label>Откуда: *</label>
            <select
              name="fromLocation"
              value={formData.fromLocation}
              onChange={handleChange}
              required
            >
              <option value="">Выберите место</option>
              {locations.map(location => (
                <option key={location.id} value={location.name}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>В цех: *</label>
            <select
              name="toWorkshop"
              value={formData.toWorkshop}
              onChange={handleChange}
              required
            >
              <option value="">Выберите цех</option>
              {workshops.map(workshop => (
                <option key={workshop.id} value={workshop.name}>
                  {workshop.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Количество (кг): *</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="1"
              max={selectedRoll ? selectedRoll.availableWeight : undefined}
              placeholder="Введите вес"
            />
            {selectedRoll && (
              <div className="form-hint">
                Доступно: {selectedRoll.availableWeight} кг
              </div>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Дата перемещения: *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Ответственный: *</label>
            <select
              name="responsible"
              value={formData.responsible}
              onChange={handleChange}
              required
            >
              <option value="">Выберите ответственного</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.name}>
                  {employee.name} ({employee.position})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedRoll && (
          <div className="form-info">
            <h3>Информация о выбранном рулоне:</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Материал:</span>
                <span className="info-value">{selectedRoll.material}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Общий вес:</span>
                <span className="info-value">{selectedRoll.weight} кг</span>
              </div>
              <div className="info-item">
                <span className="info-label">Доступно:</span>
                <span className="info-value">{selectedRoll.availableWeight} кг</span>
              </div>
              <div className="info-item">
                <span className="info-label">Текущее место:</span>
                <span className="info-value">{selectedRoll.location}</span>
              </div>
            </div>
          </div>
        )}

        <div className="form-buttons">
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={submitting || !formData.rollNumber}
          >
            {submitting ? 'Оформление...' : 'Оформить перемещение'}
          </button>
          <Link to="/">
            <button type="button" className="cancel-btn">Отмена</button>
          </Link>
        </div>
        
        <div className="form-footer">
          <small>* Обязательные поля</small>
        </div>
      </form>
    </div>
  );
};

export default RollMovementPage;