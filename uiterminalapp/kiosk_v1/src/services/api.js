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
// const transformRollData = (apiData) => {
//   if (!apiData || !Array.isArray(apiData)) {
//     console.warn('Некорректные данные от API:', apiData);
//     throw new Error('Некорректный формат данных');
//   }
  
//   console.log(`📊 Получено ${apiData.length} записей от API`);
  
//   return apiData.map((item, index) => ({
//     id: index + 1,
//     name: item.nomenclatureName || 'Без названия',
//     characteristic: item.characteristicName || 'Без характеристики',
//     batch: item.batchName || 'Без партии',
//     quantity: item.quantityBalance || 0,
//     location: 'Под краном',
//     // Сохраняем оригинальные данные для отладки
//     _original: item,
//   }));
// };


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
export const getMockRollsOld = () => {
  console.log('📁 Загружаю демонстрационные данные');
  
  const mockData = [
    {
      id: 1,
      name: 'Рулон, 0,45',
      characteristic: '6005 Зеленый',
      batch: '2026-13 (Северсталь)',
      quantity: 1460,
      location: 'Под краном',
      _isMock: true,
    },
    {
      id: 2,
      name: 'Рулон, 0,5',
      characteristic: 'Оцинковка',
      batch: '2026-7 (Северсталь)',
      quantity: 1285,
      location: 'Под краном',
      _isMock: true,
    },
    {
      id: 3,
      name: 'Рулон А',
      characteristic: 'Сталь 3мм',
      batch: 'BATCH001',
      quantity: 15,
      amountBalance: 150000,
      location: 'Под краном',
      _isMock: true,
    },
    {
      id: 4,
      name: 'Рулон B',
      characteristic: 'Алюминий 1.5мм',
      batch: 'BATCH002',
      quantity: 23,
      location: 'Под краном',
      _isMock: true,
    },
    {
      id: 5,
      name: 'Рулон C',
      characteristic: 'Медь 2мм',
      batch: 'BATCH003',
      quantity: 8,
      location: 'Под краном',
      _isMock: true,
    },
  ];
  
  return mockData;
};

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
 */
export const searchRollsOld = (rolls, filters) => {
  if (!rolls || !Array.isArray(rolls)) {
    console.warn('Некорректные данные для поиска:', rolls);
    return [];
  }

  console.log('🔍 Выполняю поиск с фильтрами:', filters);
  
  return rolls.filter(roll => {
    const nameMatch = !filters.name || 
                     (roll.name && roll.name.toLowerCase().includes(filters.name.toLowerCase()));
    
    const characteristicMatch = !filters.characteristic || 
                              (roll.characteristic && roll.characteristic.toLowerCase().includes(filters.characteristic.toLowerCase()));
    
    const batchMatch = !filters.batch || 
                      (roll.batch && roll.batch.toLowerCase().includes(filters.batch.toLowerCase()));
    
    const quantityMatch = !filters.quantity || 
                         (roll.quantity && roll.quantity.toString().includes(filters.quantity));
    
    return nameMatch && characteristicMatch && batchMatch && quantityMatch;
  });
};

// Добавьте в функцию searchRolls поддержку новых полей:
export const searchRolls = (rolls, searchParams) => {
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