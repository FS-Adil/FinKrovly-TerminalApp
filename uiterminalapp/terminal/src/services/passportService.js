import api from './api';

export const passportService = {
  // Получить все паспорта
  async getAllPassports(search = '') {
    const params = search ? { params: { search } } : {};
    const response = await api.get('/passports', params);
    return response.data;
  },

  // Получить паспорт по ID
  async getPassportById(id) {
    const response = await api.get(`/passports/${id}`);
    return response.data;
  },

  // Получить паспорт по номеру рулона
  async getPassportByRollNumber(rollNumber) {
    const response = await api.get(`/passports/roll/${rollNumber}`);
    return response.data;
  },

  // Удалить паспорт (только админ)
  async deletePassport(id) {
    const response = await api.delete(`/passports/${id}`);
    return response.data;
  },

  // Архивировать паспорт (только админ)
  async archivePassport(id) {
    const response = await api.put(`/passports/${id}/archive`);
    return response.data;
  },

  // Создать QR-код для паспорта
  generateQRCodeUrl(rollNumber) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
      `ROLL_PASSPORT:${rollNumber}\nСистема управления производством\nПаспорт рулона`
    )}`;
  },

  // Генерация PDF паспорта
  generatePassportData(passport) {
    return {
      header: 'ПАСПОРТ РУЛОНА',
      number: passport.rollNumber,
      material: passport.material,
      totalWeight: `${passport.totalWeight} кг`,
      currentLocation: passport.currentLocation,
      movementsCount: passport.movementsCount,
      totalMovedWeight: `${passport.totalMovedWeight} кг`,
      lastMovement: passport.lastMovementDate 
        ? new Date(passport.lastMovementDate).toLocaleDateString('ru-RU')
        : 'Нет перемещений',
      status: this.getStatusText(passport.status),
      createdAt: new Date(passport.createdAt).toLocaleDateString('ru-RU'),
      qrCodeUrl: this.generateQRCodeUrl(passport.rollNumber)
    };
  },

  // Перевод статуса на русский
  getStatusText(status) {
    const statusMap = {
      'active': 'Активный',
      'archived': 'Архивированный',
      'completed': 'Завершенный'
    };
    return statusMap[status] || status;
  }
};

export default passportService;