import axios from 'axios';

// Создаем экземпляр axios
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
});

// Интерцептор для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок авторизации
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен истек или недействителен
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/'; // Перенаправляем на главную
    }
    return Promise.reject(error);
  }
);

// Аутентификация
export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Основные методы API
export default api;

// Удаление перемещения (требуется авторизация)
export const deleteMovement = async (movementId) => {
  return await api.delete(`/movements/${movementId}`);
};

// Возврат рулона (требуется авторизация)
export const returnRollToAvailable = async (movementId) => {
  return await api.post('/rolls/return', { movementId });
};

// Получение профиля пользователя
export const getUserProfile = async () => {
  return await api.get('/auth/me');
};

// В конец файла добавляем:
// Методы для работы с паспортами
export const getPassports = async (search = '') => {
  const params = search ? { params: { search } } : {};
  return await api.get('/passports', params);
};

export const getPassportById = async (id) => {
  return await api.get(`/passports/${id}`);
};

export const deletePassport = async (id) => {
  return await api.delete(`/passports/${id}`);
};

export const archivePassport = async (id) => {
  return await api.put(`/passports/${id}/archive`);
};