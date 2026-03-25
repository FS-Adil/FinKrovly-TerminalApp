// Заглушка API
export const moveRoll = async (data) => {
  // Имитация задержки сети
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Имитация успешного ответа от сервера
  const response = {
    success: true,
    message: `Рулон "${data.name}" успешно перемещен в ${data.workshop}.`,
    data: {
      id: Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      ...data
    }
  };
  
  // Имитация ошибки в 10% случаев
  if (Math.random() < 0.1) {
    return {
      success: false,
      message: 'Ошибка сервера: не удалось переместить рулон.'
    };
  }
  
  return response;
};


const API_BASE_URL = '/api/v1'; // Важно: относительный путь

export const getAllRolls = async () => {
  try {
    console.log('🔄 Пытаюсь получить данные через Vite прокси...');
    
    const response = await fetch(`${API_BASE_URL}/roll-list/find-all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Успешно получено ${data.length} записей через прокси`);
    return transformRollData(data);
    
  } catch (error) {
    console.warn('❌ Прокси не сработал, использую демо-данные:', error.message);
    return getMockRolls();
  }
};


/**
 * Преобразовать данные из API в формат компонента
 */
const transformRollData = (apiData) => {
  if (!apiData || !Array.isArray(apiData)) {
    console.warn('Некорректные данные от API:', apiData);
    throw new Error('Некорректный формат данных');
  }
  
  console.log(`📊 Получено ${apiData.length} записей от API`);
  
  return apiData.map((item, index) => ({
    id: index + 1,
    name: item.nomenclatureName || 'Без названия',
    characteristic: item.characteristicName || 'Без характеристики',
    batch: item.batchName || 'Без партии',
    quantity: item.quantityBalance || null,
    weight: item.weight || null, // Добавьте эти поля
    length: item.length || null, // Добавьте эти поля
    location: item.location || 'Не указано', // ИСПРАВЬТЕ ЭТУ СТРОКУ!
    // // Сохраняем оригинальные данные для отладки
    // _original: item,
  }));
};

/**
 * Демо-данные для разработки
 */
export const getMockRolls = () => {
  return [
    {
      id: 1,
      name: 'Рулон бумаги А4',
      characteristic: '80 г/м²',
      batch: 'BATCH-2023-001',
      quantity: 100,
      weight: 120, // Новое поле
      length: 150, // Новое поле
      location: 'Под краном',
      _isMock: true
    },
    {
      id: 2,
      name: 'Рулон картона',
      characteristic: '250 г/м²',
      batch: 'BATCH-2023-002',
      quantity: 50,
      weight: 200,
      length: 100,
      location: 'В цеху',
      _isMock: true
    },
    {
      id: 1,
      name: 'Рулон бумаги А4',
      characteristic: '80 г/м²',
      batch: 'BATCH-2023-001',
      quantity: 100,
      weight: 120, // Новое поле
      length: 150, // Новое поле
      location: 'БРАК',
      _isMock: true
    },
    {
      id: 2,
      name: 'Рулон картона',
      characteristic: '250 г/м²',
      batch: 'BATCH-2023-002',
      quantity: 50,
      weight: 200,
      length: 100,
      location: 'В цеху',
      _isMock: true
    },
    {
      id: 1,
      name: 'Рулон бумаги А4',
      characteristic: '80 г/м²',
      batch: 'BATCH-2023-001',
      quantity: 100,
      weight: 120, // Новое поле
      length: 150, // Новое поле
      location: 'Под краном',
      _isMock: true
    },
    {
      id: 2,
      name: 'Рулон картона',
      characteristic: '250 г/м²',
      batch: 'BATCH-2023-002',
      quantity: 50,
      weight: 200,
      length: 100,
      location: 'В цеху',
      _isMock: true
    },
    {
      id: 1,
      name: 'Рулон бумаги А4',
      characteristic: '80 г/м²',
      batch: 'BATCH-2023-001',
      quantity: 100,
      weight: 120, // Новое поле
      length: 150, // Новое поле
      location: 'Под краном',
      _isMock: true
    },
    {
      id: 2,
      name: 'Рулон картона',
      characteristic: '250 г/м²',
      batch: 'BATCH-2023-002',
      quantity: 50,
      weight: 200,
      length: 100,
      location: 'В цеху',
      _isMock: true
    },
    // Добавьте больше демо-данных с разными местоположениями
  ];
};

/**
 * Поиск рулонов с фильтрацией
 * Поддерживает поиск по отдельным словам в наименовании
 * @param {Array} rolls - массив рулонов
 * @param {Object} searchParams - параметры поиска
 * @param {boolean} strictMode - если true, требуются все слова; если false - достаточно любого слова
 */
export const searchRolls = (rolls, searchParams, strictMode = true) => {
  if (!rolls || rolls.length === 0) return [];
  
  return rolls.filter(roll => {
    // Проверка наименования с разбивкой на слова
    let matchesName = true;
    if (searchParams.name && searchParams.name.trim() !== '') {
      const searchValue = searchParams.name.toLowerCase().trim();
      const rollName = (roll.name || '').toLowerCase();
      
      // Разбиваем поисковый запрос на отдельные слова
      const searchWords = searchValue.split(/\s+/).filter(word => word.length > 0);
      
      if (searchWords.length > 0) {
        if (strictMode) {
          // Строгий режим: должны присутствовать ВСЕ слова
          matchesName = searchWords.every(searchWord => rollName.includes(searchWord));
        } else {
          // Гибкий режим: достаточно хотя бы одного слова
          matchesName = searchWords.some(searchWord => rollName.includes(searchWord));
        }
      } else {
        matchesName = rollName.includes(searchValue);
      }
    }
    
    // Проверка характеристики (также можно добавить разбивку на слова)
    let matchesCharacteristic = true;
    if (searchParams.characteristic && searchParams.characteristic.trim() !== '') {
      const searchValue = searchParams.characteristic.toLowerCase().trim();
      const rollCharacteristic = (roll.characteristic || '').toLowerCase();
      
      const searchWords = searchValue.split(/\s+/).filter(word => word.length > 0);
      
      if (searchWords.length > 0) {
        matchesCharacteristic = strictMode 
          ? searchWords.every(word => rollCharacteristic.includes(word))
          : searchWords.some(word => rollCharacteristic.includes(word));
      } else {
        matchesCharacteristic = rollCharacteristic.includes(searchValue);
      }
    }
    
    // Проверка партии
    const matchesBatch = !searchParams.batch || 
      (roll.batch || '').toLowerCase().includes(searchParams.batch.toLowerCase());
    
    // Числовые поля
    const matchesQuantity = !searchParams.quantity || 
      (roll.quantity && roll.quantity.toString().includes(searchParams.quantity));
    
    const matchesWeight = !searchParams.weight || 
      (roll.weight && roll.weight.toString().includes(searchParams.weight));
    
    const matchesLength = !searchParams.length || 
      (roll.length && roll.length.toString().includes(searchParams.length));
    
    // Местоположение
    const matchesLocation = !searchParams.location || 
      (roll.location && roll.location.includes(searchParams.location));
    
    return matchesName && matchesCharacteristic && matchesBatch && 
           matchesQuantity && matchesWeight && matchesLength && matchesLocation;
  });
};

/**
 * Поиск рулонов с фильтрацией
 */
export const searchRolls_old = (rolls, searchParams) => {
  return rolls.filter(roll => {
    const matchesName = !searchParams.name || 
      roll.name.toLowerCase().includes(searchParams.name.toLowerCase());
    
    const matchesCharacteristic = !searchParams.characteristic || 
      roll.characteristic.toLowerCase().includes(searchParams.characteristic.toLowerCase());
    
    const matchesBatch = !searchParams.batch || 
      roll.batch.toLowerCase().includes(searchParams.batch.toLowerCase());
    
    const matchesQuantity = !searchParams.quantity || 
      roll.quantity.toString().includes(searchParams.quantity);
    
    const matchesWeight = !searchParams.weight || 
      (roll.weight && roll.weight.toString().includes(searchParams.weight));
    
    const matchesLength = !searchParams.length || 
      (roll.length && roll.length.toString().includes(searchParams.length));

    const matchesLocation = !searchParams.location || 
      (roll.location && roll.location.includes(searchParams.location));
    
    return matchesName && matchesCharacteristic && matchesBatch && 
           matchesQuantity && matchesWeight && matchesLength && matchesLocation;
  });
};

/**
 * Тест соединения с API
 */
export const testAPIConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/roll-list/find-all`, {
      method: 'GET',
      mode: 'no-cors',
    });
    
    return {
      success: true,
      status: 'Запрос отправлен (no-cors mode)',
      details: 'В режиме no-cors нельзя прочитать ответ, но соединение установлено'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      details: 'Сервер недоступен или CORS блокирует запрос'
    };
  }
};

export default {
  getAllRolls,
  searchRolls,
  getMockRolls,
  testAPIConnection,
};