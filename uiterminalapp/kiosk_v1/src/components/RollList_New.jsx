import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useKeyboard } from '../context/KeyboardContext';
import { getAllRolls, searchRolls, testAPIConnection } from '../services/api';

const RollList_New = () => {
  const [search, setSearch] = useState({ 
    name: '', 
    characteristic: '', 
    batch: '', 
    quantity: '',
    weight: '',
    length: '',
    location: ''
  });
  const [rolls, setRolls] = useState([]);
  const [filteredRolls, setFilteredRolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc' // 'asc' или 'desc'
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showKeyboard } = useKeyboard();

  useEffect(() => {
    fetchRolls();
    
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Автоматический фильтр при изменении поиска
  // const [strictSearch, setStrictSearch] = useState(true); // true - все слова, false - любое слово

  useEffect(() => {
    if (rolls.length > 0) {
      // const results = searchRolls(rolls, search);
      const results = searchRolls(
        rolls, 
        search, 
        // strictSearch
      );
      const sortedResults = sortData(results, sortConfig);
      setFilteredRolls(sortedResults);
    }
  }, [rolls, search, sortConfig]);

  // Функция сортировки данных
  const sortData = (data, config) => {
    if (!config.key) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[config.key];
      const bValue = b[config.key];
      
      // Проверка на существование значений
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      // Для строк
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue, 'ru', { sensitivity: 'base' });
        return config.direction === 'asc' ? comparison : -comparison;
      }
      
      // Для чисел
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return config.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Для смешанных типов
      const comparison = String(aValue).localeCompare(String(bValue), 'ru', { sensitivity: 'base' });
      return config.direction === 'asc' ? comparison : -comparison;
    });
  };

  // Функция для изменения сортировки
  const requestSort = (key) => {
    let direction = 'asc';
    
    // Если уже сортируем по этому полю, меняем направление
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  // Получение класса для заголовка таблицы
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return '↕️'; // Нейтральная иконка
    }
    
    return sortConfig.direction === 'asc' ? '⬆️' : '⬇️';
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const testConnection = async () => {
    const status = await testAPIConnection();
    setConnectionStatus(status);
  };

  const fetchRolls = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingMockData(false);
      
      console.log('🔄 Начинаю загрузку данных...');
      const data = await getAllRolls();

      console.log('📊 Данные получены из API:', data);
      if (data && data.length > 0) {
        console.log('📍 Первая запись:', data[0]);
        console.log('📍 Поле location первой записи:', data[0].location);
      }
      
      const isMockData = data.length > 0 && data[0]._isMock === true;
      
      setUsingMockData(isMockData);
      setRolls(data);
      
      if (isMockData) {
        setError('⚠️ Использую демонстрационные данные. Реальный сервер недоступен.');
      } else {
        console.log(`✅ Успешно загружено ${data.length} записей`);
      }
      
    } catch (err) {
      console.error('❌ Ошибка при загрузке:', err);
      setError(`Ошибка загрузки: ${err.message || 'Неизвестная ошибка'}`);
      setUsingMockData(true);
      
      const { getMockRolls } = await import('../services/api');
      const demoData = getMockRolls();
      setRolls(demoData);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearch(prev => ({ ...prev, [name]: value }));
  };

  const handleInputClick = (fieldName, value, inputType = 'text') => {
    showKeyboard(value, (e) => handleSearchChange(e), inputType, fieldName);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const results = searchRolls(rolls, search);
    const sortedResults = sortData(results, sortConfig);
    setFilteredRolls(sortedResults);
  };

  const handleReset = () => {
    setSearch({ 
      name: '', 
      characteristic: '', 
      batch: '', 
      quantity: '',
      weight: '',
      length: '',
      location: ''
    });
    // Сбрасываем сортировку к исходному состоянию
    setSortConfig({ key: 'name', direction: 'asc' });
  };

  const handleMove = (roll) => {
    navigate('/move', { state: { selectedRoll: roll } });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <h3 style={{ color: '#3498db' }}>Загрузка данных...</h3>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Кнопка "Наверх" */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
            cursor: 'pointer',
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            opacity: 0.9
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2980b9';
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.opacity = 1;
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(52, 152, 219, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#3498db';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.opacity = 0.9;
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(52, 152, 219, 0.3)';
          }}
          title="Вернуться наверх"
        >
          ↑
        </button>
      )}

      <div style={{ 
        marginBottom: '30px', 
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>
            📦 Список рулонов
            {usingMockData && (
              <span style={{
                fontSize: '14px',
                color: '#e74c3c',
                marginLeft: '10px',
                backgroundColor: '#ffeaa7',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                (Демо-режим)
              </span>
            )}
          </h2>
          <p style={{ color: '#666' }}>Используйте форму ниже для поиска и фильтрации рулонов</p>
        </div>
        <button 
          onClick={fetchRolls} 
          className="refresh-btn"
          title="Обновить данные"
          style={{
            padding: '8px 16px',
            backgroundColor: usingMockData ? '#e74c3c' : '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {usingMockData ? 'Попробовать снова' : '🔄 Обновить'}
        </button>
      </div>
      
      {/* Форма поиска */}
      <div className="search-form" style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>🔍 Поиск рулонов</h3>
        <form onSubmit={handleSearch}>
          <div className="form-row" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div className="form-group">
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#34495e'
              }}>Наименование</label>
              <input
                type="text"
                name="name"
                value={search.name}
                onClick={() => handleInputClick('name', search.name)}
                onChange={handleSearchChange}
                className="input-with-keyboard keyboard-hint"
                placeholder="Введите наименование"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div className="form-group">
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#34495e'
              }}>Характеристика</label>
              <input
                type="text"
                name="characteristic"
                value={search.characteristic}
                onClick={() => handleInputClick('characteristic', search.characteristic)}
                onChange={handleSearchChange}
                className="input-with-keyboard keyboard-hint"
                placeholder="Введите характеристику"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div className="form-group">
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#34495e'
              }}>Партия</label>
              <input
                type="text"
                name="batch"
                value={search.batch}
                onClick={() => handleInputClick('batch', search.batch)}
                onChange={handleSearchChange}
                className="input-with-keyboard keyboard-hint"
                placeholder="Введите партию"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div className="form-group">
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#34495e'
              }}>Количество</label>
              <input
                type="number"
                name="quantity"
                value={search.quantity}
                onClick={() => handleInputClick('quantity', search.quantity, 'number')}
                onChange={handleSearchChange}
                className="input-with-keyboard keyboard-hint"
                placeholder="Введите количество"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
          
          <div className="form-row" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div className="form-group">
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#34495e'
              }}>Вес (кг)</label>
              <input
                type="number"
                name="weight"
                value={search.weight}
                onClick={() => handleInputClick('weight', search.weight, 'number')}
                onChange={handleSearchChange}
                className="input-with-keyboard keyboard-hint"
                placeholder="Введите вес"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div className="form-group">
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#34495e'
              }}>Длина (м)</label>
              <input
                type="number"
                name="length"
                value={search.length}
                onClick={() => handleInputClick('length', search.length, 'number')}
                onChange={handleSearchChange}
                className="input-with-keyboard keyboard-hint"
                placeholder="Введите длину"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div className="form-group">
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#34495e'
              }}>Местоположение</label>
              <select
                name="location"
                value={search.location}
                onChange={handleSearchChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">Все местоположения</option>
                <option value="Под краном">Под краном</option>
                <option value="В цеху">В цеху</option>
                <option value="БРАК">БРАК</option>
              </select>
            </div>
            {/* <div className="form-group">
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#34495e'
              }}>Поиск по всем полям</label>
              <input
                type="text"
                name="globalSearch"
                placeholder="Быстрый поиск..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#fffde7'
                }}
                onKeyUp={(e) => {
                  const value = e.target.value.toLowerCase();
                  if (value) {
                    const results = rolls.filter(roll => 
                      roll.name.toLowerCase().includes(value) ||
                      roll.characteristic.toLowerCase().includes(value) ||
                      roll.batch.toLowerCase().includes(value) ||
                      roll.location.toLowerCase().includes(value) ||
                      roll.weight?.toString().includes(value) ||
                      roll.length?.toString().includes(value) ||
                      roll.quantity.toString().includes(value)
                    );
                    const sortedResults = sortData(results, sortConfig);
                    setFilteredRolls(sortedResults);
                  } else {
                    const results = searchRolls(rolls, search);
                    const sortedResults = sortData(results, sortConfig);
                    setFilteredRolls(sortedResults);
                  }
                }}
              />
            </div> */}
          </div>

          {/* 🔽🔽🔽 ЗДЕСЬ ВСТАВИТЬ БЛОК С ЧЕКБОКСОМ 🔽🔽🔽 */}
          {/* <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: '#fff',
            borderRadius: '4px',
            border: '1px solid #e0e0e0'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={strictSearch}
                onChange={(e) => setStrictSearch(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: '500', color: '#34495e' }}>Строгий поиск (все слова)</span>
            </label>
            <span style={{ fontSize: '12px', color: '#666' }}>
              {strictSearch ? '🔍 Должны присутствовать все слова' : '🔍 Достаточно любого слова'}
            </span>
          </div> */}
          {/* 🔼🔼🔼 КОНЕЦ БЛОКА С ЧЕКБОКСОМ 🔼🔼🔼 */}
          
          <div style={{ 
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <div style={{ 
              fontSize: '12px', 
              color: '#666',
              flex: 1
            }}>
              💡 Подсказка: Нажмите на поле для открытия виртуальной клавиатуры
            </div>
            
            <div style={{ 
              display: 'flex',
              gap: '10px'
            }}>
              <button 
                type="button" 
                onClick={handleReset}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Сбросить
              </button>
              <button 
                type="submit" 
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Найти
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Баннер с состоянием */}
      {error && (
        <div style={{
          backgroundColor: usingMockData ? '#ffeaa7' : '#ff7675',
          color: usingMockData ? '#d35400' : 'white',
          padding: '12px 15px',
          borderRadius: '4px',
          marginBottom: '20px',
          borderLeft: `4px solid ${usingMockData ? '#fdcb6e' : '#e74c3c'}`,
          fontSize: '14px'
        }}>
          <strong>{usingMockData ? '⚠️ Внимание:' : '❌ Ошибка:'}</strong> {error}
        </div>
      )}
      
      {/* Информация о сортировке */}
      {sortConfig.key && (
        <div style={{
          marginBottom: '15px',
          padding: '10px 15px',
          backgroundColor: '#e3f2fd',
          borderRadius: '4px',
          fontSize: '14px',
          color: '#0d47a1',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>📊 Сортировка:</span>
          <span style={{ fontWeight: '500' }}>
            По {getFieldName(sortConfig.key)} {sortConfig.direction === 'asc' ? '(по возрастанию)' : '(по убыванию)'}
          </span>
          <button 
            onClick={() => setSortConfig({ key: '', direction: 'asc' })}
            style={{
              marginLeft: 'auto',
              padding: '4px 8px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Сбросить сортировку
          </button>
        </div>
      )}
      
      {/* Таблица результатов */}
      <div className="table-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#2c3e50', margin: 0 }}>
            📋 Результаты поиска
            <span style={{ 
              fontSize: '14px', 
              color: '#666',
              marginLeft: '10px',
              fontWeight: 'normal'
            }}>
              (Найдено: {filteredRolls.length} из {rolls.length})
            </span>
          </h3>
          
          <div style={{ 
            fontSize: '14px', 
            color: '#7f8c8d',
            backgroundColor: '#ecf0f1',
            padding: '4px 12px',
            borderRadius: '20px'
          }}>
            Фильтр активен: {
              Object.values(search).some(val => val !== '') ? 'Да' : 'Нет'
            }
          </div>
        </div>
        
        {filteredRolls.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            color: '#666'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🤔</div>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>Рулоны не найдены</p>
            <p style={{ fontSize: '14px', marginBottom: '20px' }}>
              Попробуйте изменить параметры поиска или сбросить фильтры
            </p>
            <button 
              onClick={handleReset}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Сбросить фильтры и показать все
            </button>
          </div>
        ) : (
          <div style={{ 
            overflowX: 'auto',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '900px'
            }}>
              <thead>
                <tr style={{
                  backgroundColor: '#121193',
                  color: 'white'
                }}>
                  <th style={{
                    padding: '12px 15px',
                    textAlign: 'left',
                    fontWeight: '500',
                    borderRight: '1px solid #34495e'
                  }}>ID</th>
                  <th 
                    style={{
                      padding: '12px 15px',
                      textAlign: 'left',
                      fontWeight: '500',
                      borderRight: '1px solid #34495e',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onClick={() => requestSort('name')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      Наименование
                      <span style={{ fontSize: '12px' }}>
                        {getSortIcon('name')}
                      </span>
                    </div>
                  </th>
                  <th 
                    style={{
                      padding: '12px 15px',
                      textAlign: 'left',
                      fontWeight: '500',
                      borderRight: '1px solid #34495e',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onClick={() => requestSort('characteristic')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      Характеристика
                      <span style={{ fontSize: '12px' }}>
                        {getSortIcon('characteristic')}
                      </span>
                    </div>
                  </th>
                  <th 
                    style={{
                      padding: '12px 15px',
                      textAlign: 'left',
                      fontWeight: '500',
                      borderRight: '1px solid #34495e',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onClick={() => requestSort('batch')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      Партия
                      <span style={{ fontSize: '12px' }}>
                        {getSortIcon('batch')}
                      </span>
                    </div>
                  </th>
                  <th 
                    style={{
                      padding: '12px 15px',
                      textAlign: 'left',
                      fontWeight: '500',
                      borderRight: '1px solid #34495e',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onClick={() => requestSort('quantity')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      Количество
                      <span style={{ fontSize: '12px' }}>
                        {getSortIcon('quantity')}
                      </span>
                    </div>
                  </th>
                  <th 
                    style={{
                      padding: '12px 15px',
                      textAlign: 'left',
                      fontWeight: '500',
                      borderRight: '1px solid #34495e',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onClick={() => requestSort('weight')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      Вес (кг)
                      <span style={{ fontSize: '12px' }}>
                        {getSortIcon('weight')}
                      </span>
                    </div>
                  </th>
                  <th 
                    style={{
                      padding: '12px 15px',
                      textAlign: 'left',
                      fontWeight: '500',
                      borderRight: '1px solid #34495e',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onClick={() => requestSort('length')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      Длина (м)
                      <span style={{ fontSize: '12px' }}>
                        {getSortIcon('length')}
                      </span>
                    </div>
                  </th>
                  <th 
                    style={{
                      padding: '12px 15px',
                      textAlign: 'left',
                      fontWeight: '500',
                      borderRight: '1px solid #34495e',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onClick={() => requestSort('location')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      Местоположение
                      <span style={{ fontSize: '12px' }}>
                        {getSortIcon('location')}
                      </span>
                    </div>
                  </th>
                  <th style={{
                    padding: '12px 15px',
                    textAlign: 'left',
                    fontWeight: '500'
                  }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredRolls.map((roll, index) => (
                  <tr 
                    key={roll.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                      borderBottom: '1px solid #eee',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e3f2fd'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f8f9fa' : 'white'}
                  >
                    <td style={{
                      padding: '12px 15px',
                      fontWeight: '500',
                      color: '#2c3e50',
                      borderRight: '1px solid #eee'
                    }}>{roll.id}</td>
                    <td style={{
                      padding: '12px 15px',
                      borderRight: '1px solid #eee'
                    }}>
                      {roll.name}
                      {roll._isMock && (
                        <span style={{
                          fontSize: '10px',
                          color: '#95a5a6',
                          marginLeft: '5px',
                          fontStyle: 'italic'
                        }}>
                          демо
                        </span>
                      )}
                    </td>
                    <td style={{
                      padding: '12px 15px',
                      borderRight: '1px solid #eee'
                    }}>{roll.characteristic}</td>
                    <td style={{
                      padding: '12px 15px',
                      borderRight: '1px solid #eee'
                    }}>{roll.batch}</td>
                    <td style={{
                      padding: '12px 15px',
                      fontWeight: '600',
                      color: '#27ae60',
                      borderRight: '1px solid #eee'
                    }}>{roll.quantity.toLocaleString()}</td>
                    <td style={{
                      padding: '12px 15px',
                      fontWeight: '500',
                      color: '#8e44ad',
                      borderRight: '1px solid #eee'
                    }}>
                      {roll.weight ? `${roll.weight.toLocaleString()} кг` : '-'}
                    </td>
                    <td style={{
                      padding: '12px 15px',
                      fontWeight: '500',
                      color: '#d35400',
                      borderRight: '1px solid #eee'
                    }}>
                      {roll.length ? `${roll.length.toLocaleString()} м` : '-'}
                    </td>
                    <td style={{
                      padding: '12px 15px',
                      borderRight: '1px solid #eee'
                    }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        backgroundColor: roll.location === 'Под краном' ? '#e3f2fd' : 
                                        roll.location === 'В цеху' ? '#e8f5e9' : 
                                        '#f3e5f5',
                        color: roll.location === 'Под краном' ? '#1976d2' : 
                                roll.location === 'В цеху' ? '#2e7d32' : 
                                '#7b1fa2',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {roll.location || 'Не указано'}
                      </span>
                    </td>
                    <td style={{
                      padding: '12px 15px'
                    }}>
                      <button 
                        onClick={() => handleMove(roll)}
                        disabled={user?.role !== 'operator'}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: user?.role === 'operator' ? '#2ecc71' : '#bdc3c7',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: user?.role === 'operator' ? 'pointer' : 'not-allowed',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (user?.role === 'operator') {
                            e.currentTarget.style.backgroundColor = '#27ae60';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (user?.role === 'operator') {
                            e.currentTarget.style.backgroundColor = '#2ecc71';
                          }
                        }}
                      >
                        {user?.role === 'operator' ? '➡️ Переместить' : 'Требуется роль оператора'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Информация о фильтрации */}
      {Object.values(search).some(val => val !== '') && filteredRolls.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '10px 15px',
          backgroundColor: '#e3f2fd',
          borderRadius: '4px',
          borderLeft: '4px solid #2196f3',
          fontSize: '14px',
          color: '#0d47a1'
        }}>
          <strong>💡 Фильтр активен:</strong> Показаны только рулоны, соответствующие критериям поиска.
          {filteredRolls.length < rolls.length && (
            <span style={{ marginLeft: '10px' }}>
              Отфильтровано {rolls.length - filteredRolls.length} из {rolls.length} записей.
            </span>
          )}
          {search.location && (
            <div style={{ marginTop: '5px' }}>
              <strong>Местоположение:</strong> {search.location}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Вспомогательная функция для получения читаемого имени поля
const getFieldName = (key) => {
  const fieldNames = {
    'name': 'Наименованию',
    'characteristic': 'Характеристике',
    'batch': 'Партии',
    'quantity': 'Количеству',
    'weight': 'Весy',
    'length': 'Длине',
    'location': 'Местоположению'
  };
  return fieldNames[key] || key;
};

export default RollList_New;