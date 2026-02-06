import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Инициализация Sequelize с SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false,
});

// Экспортируем Op из Sequelize
export const Op = Sequelize.Op;

// Модель для рулонов
export const Roll = sequelize.define('Roll', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  material: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  availableWeight: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  width: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  length: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  productionDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('available', 'in-transit', 'reserved'),
    defaultValue: 'available',
  },
}, {
  timestamps: true,
});

// Модель для мест хранения
export const Location = sequelize.define('Location', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.ENUM('warehouse', 'workshop', 'preparation'),
    defaultValue: 'warehouse',
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true,
});

// Модель для цехов
export const Workshop = sequelize.define('Workshop', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
});

// Модель для сотрудников
export const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
});

// Модель для перемещений
export const Movement = sequelize.define('Movement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  rollNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fromLocation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  toWorkshop: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  responsible: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('completed', 'cancelled', 'pending'),
    defaultValue: 'completed',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
});

// Модель для паспорта рулона
export const Passport = sequelize.define('Passport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  rollNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rollId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  material: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  totalWeight: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  currentLocation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  movementsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalMovedWeight: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  lastMovementDate: {
    type: DataTypes.DATE,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.ENUM('active', 'archived', 'completed'),
    defaultValue: 'active',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
});


// Модель для пользователей (админы)
export const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'operator', 'viewer'),
    defaultValue: 'viewer',
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
});

// Синхронизация базы данных и начальные данные
export const initDatabase = async () => {
  try {
    // Синхронизация моделей с БД
    await sequelize.sync({ force: false });
    
    console.log('📊 База данных подключена');
    
    // Проверяем, есть ли начальные данные
    const rollCount = await Roll.count();
    const locationCount = await Location.count();
    const workshopCount = await Workshop.count();
    const employeeCount = await Employee.count();
    const userCount = await User.count();
    
    // Добавляем начальные данные если таблицы пустые
    if (locationCount === 0) {
      await Location.bulkCreate([
        { name: 'Склад 1', type: 'warehouse', capacity: 1000 },
        { name: 'Склад 2', type: 'warehouse', capacity: 800 },
        { name: 'Склад 3', type: 'warehouse', capacity: 1200 },
        { name: 'Цех подготовки', type: 'preparation', capacity: 500 },
        { name: 'Приемная зона', type: 'warehouse', capacity: 300 },
      ]);
      console.log('✅ Добавлены места хранения');
    }
    
    if (workshopCount === 0) {
      await Workshop.bulkCreate([
        { name: 'Цех печати', description: 'Печать на материалах', active: true },
        { name: 'Цех ламинации', description: 'Ламинация продукции', active: true },
        { name: 'Цех резки', description: 'Резка рулонов', active: true },
        { name: 'Цех упаковки', description: 'Упаковка готовой продукции', active: true },
        { name: 'Цех препресс', description: 'Подготовка к печати', active: true },
      ]);
      console.log('✅ Добавлены цеха');
    }
    
    if (employeeCount === 0) {
      await Employee.bulkCreate([
        { name: 'Иванов Иван Иванович', position: 'Кладовщик', department: 'Склад' },
        { name: 'Петров Петр Петрович', position: 'Мастер смены', department: 'Производство' },
        { name: 'Сидоров Сергей Сергеевич', position: 'Оператор', department: 'Производство' },
        { name: 'Кузнецов Константин Константинович', position: 'Начальник цеха', department: 'Производство' },
        { name: 'Васильев Василий Васильевич', position: 'Технолог', department: 'Производство' },
      ]);
      console.log('✅ Добавлены сотрудники');
    }
    
    if (rollCount === 0) {
      const today = new Date();
      await Roll.bulkCreate([
        { 
          number: 'RLL-2024-001', 
          material: 'Картон 300гр', 
          weight: 1500, 
          availableWeight: 1200, 
          location: 'Склад 1',
          width: 1200,
          length: 500,
          productionDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14),
          status: 'available'
        },
        { 
          number: 'RLL-2024-002', 
          material: 'Пленка ПВХ', 
          weight: 800, 
          availableWeight: 800, 
          location: 'Склад 2',
          width: 1300,
          length: 300,
          productionDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 9),
          status: 'available'
        },
        { 
          number: 'RLL-2024-003', 
          material: 'Бумага мелованная', 
          weight: 2000, 
          availableWeight: 1500, 
          location: 'Склад 1',
          width: 1100,
          length: 600,
          productionDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 19),
          status: 'available'
        },
        { 
          number: 'RLL-2024-004', 
          material: 'Картон 400гр', 
          weight: 1800, 
          availableWeight: 900, 
          location: 'Склад 3',
          width: 1250,
          length: 450,
          productionDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 11),
          status: 'available'
        },
      ]);
      console.log('✅ Добавлены тестовые рулоны');
    }
    
    if (userCount === 0) {
      // Для демонстрации - в реальном приложении используйте bcrypt
      await User.create({
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        email: 'admin@company.com',
        active: true
      });
      
      await User.create({
        username: 'operator',
        password: 'operator123',
        role: 'operator',
        email: 'operator@company.com',
        active: true
      });
      
      console.log('✅ Добавлены пользователи');
      console.log('   👑 Админ: admin / admin123');
      console.log('   👷 Оператор: operator / operator123');
    }
    
    console.log('🎉 База данных инициализирована');
    
  } catch (error) {
    console.error('❌ Ошибка при инициализации базы данных:', error);
    throw error;
  }
};

// Экспортируем sequelize
export { sequelize };