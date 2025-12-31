import { Roll, Location, Workshop, Employee, User, initDatabase } from './database.js';

const seedDatabase = async () => {
  try {
    console.log('🌱 Начало сидирования базы данных...');
    
    await initDatabase();
    
    console.log('✅ Сидирование завершено');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Ошибка при сидировании:', error);
    process.exit(1);
  }
};

seedDatabase();