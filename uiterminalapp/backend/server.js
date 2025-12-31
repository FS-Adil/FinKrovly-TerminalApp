import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { 
  sequelize, 
  Roll, 
  Location, 
  Workshop, 
  Employee, 
  Movement, 
  User, 
  initDatabase,
  Op, // Импортируем Op
  Passport
} from './database.js';

const app = express();
app.use(cors());
app.use(express.json());

// Конфигурация
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

// Middleware для логирования
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware для проверки JWT токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Требуется аутентификация' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// Middleware для проверки прав администратора
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Требуются права администратора' });
  }
  next();
};


// ========== АВТОРИЗАЦИЯ ==========

// Регистрация пользователя
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, email, role } = req.body;
    
    // Проверяем существование пользователя
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }
    
    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Создаем пользователя
    const user = await User.create({
      username,
      password: hashedPassword,
      email,
      role: role || 'viewer',
      active: true
    });
    
    // Создаем JWT токен
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Вход в систему
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Ищем пользователя
    const user = await User.findOne({ 
      where: { 
        username,
        active: true 
      } 
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }
    
    // Для демонстрации - простая проверка пароля
    // В реальном приложении используйте bcrypt.compare
    if (password !== user.password) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }
    
    // Обновляем время последнего входа
    await user.update({ lastLogin: new Date() });
    
    // Создаем JWT токен
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== РУЛОНЫ ==========

// Получить все рулоны
app.get('/api/rolls', async (req, res) => {
  try {
    const { search, status } = req.query;
    let where = {};
    
    if (search) {
      where = {
        [Op.or]: [
          { number: { [Op.like]: `%${search}%` } },
          { material: { [Op.like]: `%${search}%` } },
          { location: { [Op.like]: `%${search}%` } }
        ]
      };
    }
    
    if (status) {
      where.status = status;
    }
    
    const rolls = await Roll.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    
    res.json(rolls);
    
  } catch (error) {
    console.error('Ошибка при получении рулонов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить доступные рулоны
app.get('/api/rolls/available', async (req, res) => {
  try {
    const rolls = await Roll.findAll({
      where: { 
        status: 'available',
        availableWeight: { [Op.gt]: 0 }
      },
      order: [['number', 'ASC']]
    });
    
    res.json(rolls);
    
  } catch (error) {
    console.error('Ошибка при получении доступных рулонов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить рулон по ID
app.get('/api/rolls/:id', async (req, res) => {
  try {
    const roll = await Roll.findByPk(req.params.id);
    
    if (!roll) {
      return res.status(404).json({ error: 'Рулон не найден' });
    }
    
    res.json(roll);
    
  } catch (error) {
    console.error('Ошибка при получении рулона:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать новый рулон (требуется аутентификация)
app.post('/api/rolls', authenticateToken, async (req, res) => {
  try {
    const rollData = req.body;
    
    // Проверяем уникальность номера
    const existingRoll = await Roll.findOne({ where: { number: rollData.number } });
    if (existingRoll) {
      return res.status(400).json({ error: 'Рулон с таким номером уже существует' });
    }
    
    const roll = await Roll.create(rollData);
    
    res.status(201).json({
      success: true,
      roll,
      message: 'Рулон успешно создан'
    });
    
  } catch (error) {
    console.error('Ошибка при создании рулона:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить рулон (требуется аутентификация)
app.put('/api/rolls/:id', authenticateToken, async (req, res) => {
  try {
    const roll = await Roll.findByPk(req.params.id);
    
    if (!roll) {
      return res.status(404).json({ error: 'Рулон не найден' });
    }
    
    await roll.update(req.body);
    
    res.json({
      success: true,
      roll,
      message: 'Рулон успешно обновлен'
    });
    
  } catch (error) {
    console.error('Ошибка при обновлении рулона:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== ПАСПОРТА РУЛОНОВ ==========

// Получить все паспорта
app.get('/api/passports', async (req, res) => {
  try {
    const { search, status } = req.query;
    let where = {};
    
    if (search) {
      where = {
        [Op.or]: [
          { rollNumber: { [Op.like]: `%${search}%` } },
          { material: { [Op.like]: `%${search}%` } },
          { currentLocation: { [Op.like]: `%${search}%` } }
        ]
      };
    }
    
    if (status) {
      where.status = status;
    }
    
    const passports = await Passport.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    
    res.json(passports);
    
  } catch (error) {
    console.error('Ошибка при получении паспортов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить паспорт по ID
app.get('/api/passports/:id', async (req, res) => {
  try {
    const passport = await Passport.findByPk(req.params.id);
    
    if (!passport) {
      return res.status(404).json({ error: 'Паспорт не найден' });
    }
    
    // Получаем историю перемещений для этого рулона
    const movements = await Movement.findAll({
      where: { rollNumber: passport.rollNumber },
      order: [['date', 'DESC']]
    });
    
    res.json({
      ...passport.toJSON(),
      movements
    });
    
  } catch (error) {
    console.error('Ошибка при получении паспорта:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить паспорт по номеру рулона
app.get('/api/passports/roll/:rollNumber', async (req, res) => {
  try {
    const passport = await Passport.findOne({
      where: { rollNumber: req.params.rollNumber }
    });
    
    if (!passport) {
      return res.status(404).json({ error: 'Паспорт не найден' });
    }
    
    // Получаем историю перемещений
    const movements = await Movement.findAll({
      where: { rollNumber: passport.rollNumber },
      order: [['date', 'DESC']]
    });
    
    res.json({
      ...passport.toJSON(),
      movements
    });
    
  } catch (error) {
    console.error('Ошибка при получении паспорта:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить паспорт (только админ)
app.delete('/api/passports/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const passport = await Passport.findByPk(req.params.id);
    
    if (!passport) {
      return res.status(404).json({ error: 'Паспорт не найден' });
    }
    
    await passport.destroy();
    
    res.json({ 
      success: true, 
      message: 'Паспорт удален' 
    });
    
  } catch (error) {
    console.error('Ошибка при удалении паспорта:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Архивировать паспорт (только админ)
app.put('/api/passports/:id/archive', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const passport = await Passport.findByPk(req.params.id);
    
    if (!passport) {
      return res.status(404).json({ error: 'Паспорт не найден' });
    }
    
    await passport.update({ 
      status: 'archived',
      notes: 'Архивирован администратором'
    });
    
    res.json({ 
      success: true, 
      message: 'Паспорт архивирован' 
    });
    
  } catch (error) {
    console.error('Ошибка при архивации паспорта:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== МЕСТА ХРАНЕНИЯ ==========

app.get('/api/locations', async (req, res) => {
  try {
    const locations = await Location.findAll({
      order: [['name', 'ASC']]
    });
    
    res.json(locations);
    
  } catch (error) {
    console.error('Ошибка при получении мест:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== ЦЕХА ==========

app.get('/api/workshops', async (req, res) => {
  try {
    const workshops = await Workshop.findAll({
      where: { active: true },
      order: [['name', 'ASC']]
    });
    
    res.json(workshops);
    
  } catch (error) {
    console.error('Ошибка при получении цехов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== СОТРУДНИКИ ==========

app.get('/api/employees', async (req, res) => {
  try {
    const employees = await Employee.findAll({
      where: { active: true },
      order: [['name', 'ASC']]
    });
    
    res.json(employees);
    
  } catch (error) {
    console.error('Ошибка при получении сотрудников:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== ПЕРЕМЕЩЕНИЯ ==========

// Получить историю перемещений
app.get('/api/movements/history', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    
    const movements = await Movement.findAll({
      order: [['date', 'DESC']],
      limit
    });
    
    res.json(movements);
    
  } catch (error) {
    console.error('Ошибка при получении истории:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать перемещение
app.post('/api/movements', async (req, res) => {
  try {
    const movementData = req.body;
    
    // Валидация
    if (!movementData.rollNumber || !movementData.fromLocation || 
        !movementData.toWorkshop || !movementData.quantity || !movementData.responsible) {
      return res.status(400).json({ 
        error: 'Не все обязательные поля заполнены',
        required: ['rollNumber', 'fromLocation', 'toWorkshop', 'quantity', 'responsible']
      });
    }
    
    // Находим рулон
    const roll = await Roll.findOne({ 
      where: { 
        number: movementData.rollNumber,
        status: 'available'
      } 
    });
    
    if (!roll) {
      return res.status(404).json({ error: 'Рулон не найден или недоступен' });
    }
    
    // Проверяем доступный вес
    if (parseFloat(movementData.quantity) > roll.availableWeight) {
      return res.status(400).json({ 
        error: `Недостаточно доступного веса. Максимум: ${roll.availableWeight} кг`,
        availableWeight: roll.availableWeight
      });
    }
    
    // Начинаем транзакцию
    const result = await sequelize.transaction(async (t) => {
      // Создаем запись о перемещении
      const movement = await Movement.create({
        ...movementData,
        date: movementData.date || new Date(),
        status: 'completed'
      }, { transaction: t });
      
      // Обновляем рулон
      const newAvailableWeight = roll.availableWeight - parseFloat(movementData.quantity);
      
      await roll.update({
        availableWeight: newAvailableWeight,
        status: newAvailableWeight <= 0 ? 'in-transit' : 'available'
      }, { transaction: t });
      

// ========== УДАЛЕНИЕ ПЕРЕМЕЩЕНИЙ ==========

// Удалить перемещение (только админ)
app.delete('/api/movements/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('📝 DELETE /api/movements/:id вызван');
    console.log('📝 Параметры:', req.params);
    console.log('📝 ID для удаления:', req.params.id);
    
    const movementId = parseInt(req.params.id);
    
    // Проверяем, есть ли перемещение
    const movement = await Movement.findByPk(movementId);
    
    if (!movement) {
      console.log('❌ Перемещение не найдено');
      return res.status(404).json({ 
        success: false,
        error: 'Перемещение не найдено',
        requestedId: movementId
      });
    }
    
    console.log('✅ Найдено перемещение:', movement.toJSON());
    
    // Находим связанный рулон
    const roll = await Roll.findOne({
      where: { number: movement.rollNumber }
    });
    
    if (roll) {
      console.log('✅ Найден связанный рулон:', roll.toJSON());
      
      // Возвращаем вес рулону
      const newAvailableWeight = roll.availableWeight + parseFloat(movement.quantity);
      
      await roll.update({
        availableWeight: newAvailableWeight,
        status: 'available',
        location: movement.fromLocation
      });
      
      console.log('✅ Рулон обновлен');
      
      // Обновляем паспорт
      const passport = await Passport.findOne({
        where: { rollNumber: movement.rollNumber }
      });
      
      if (passport) {
        await passport.update({
          currentLocation: movement.fromLocation,
          movementsCount: 0,
          totalMovedWeight: 0,
          lastMovementDate: null,
          status: 'active',
          notes: 'Перемещение отменено',
          updatedAt: new Date()
        });
        
        console.log('✅ Паспорт обновлен');
      }
    }
    
    // Удаляем перемещение
    await movement.destroy();
    
    console.log('✅ Перемещение удалено');
    
    res.json({
      success: true,
      message: 'Перемещение удалено. Рулон возвращен в исходное состояние.',
      deletedId: movementId
    });
    
  } catch (error) {
    console.error('❌ Ошибка при удалении перемещения:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Ошибка сервера',
      details: error.message
    });
  }
});


  // ========== СОЗДАЕМ/ОБНОВЛЯЕМ ПАСПОРТ РУЛОНА ==========
  let passport = await Passport.findOne({
    where: { rollNumber: movement.rollNumber },
    transaction: t
  });

  if (!passport) {
    // Создаем новый паспорт
    passport = await Passport.create({
      rollNumber: roll.number,
      rollId: roll.id,
      material: roll.material,
      totalWeight: roll.weight,
      currentLocation: movement.toWorkshop,
      movementsCount: 1,
      totalMovedWeight: movement.quantity,
      lastMovementDate: movement.date,
      status: 'active',
      notes: 'Создан автоматически при первом перемещении'
    }, { transaction: t });
  } else {
    // Обновляем существующий паспорт
    const newMovementsCount = passport.movementsCount + 1;
    const newTotalMovedWeight = passport.totalMovedWeight + parseFloat(movement.quantity);
    
    await passport.update({
      currentLocation: movement.toWorkshop,
      movementsCount: newMovementsCount,
      totalMovedWeight: newTotalMovedWeight,
      lastMovementDate: movement.date,
      updatedAt: new Date(),
      notes: `Обновлен после перемещения #${newMovementsCount}`
    }, { transaction: t });
  }
      // ========== КОНЕЦ СОЗДАНИЯ ПАСПОРТА ==========
      
      return { movement, roll, passport };
    });
    
    res.json({
      success: true,
      movement: result.movement,
      roll: result.roll,
      passport: result.passport, // Возвращаем также паспорт
      message: 'Перемещение успешно оформлено. Паспорт рулона обновлен.'
    });
    
  } catch (error) {
    console.error('Ошибка при оформлении перемещения:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Возврат рулона (только админ)
app.post('/api/rolls/return', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { movementId } = req.body;
    
    if (!movementId) {
      return res.status(400).json({ error: 'Не указан ID перемещения' });
    }
    
    const movement = await Movement.findByPk(movementId);
    
    if (!movement) {
      return res.status(404).json({ error: 'Перемещение не найдено' });
    }
    
    // Находим рулон
    const roll = await Roll.findOne({ 
      where: { number: movement.rollNumber } 
    });
    
    if (!roll) {
      return res.status(404).json({ error: 'Рулон не найден' });
    }
    
    // Начинаем транзакцию
    await sequelize.transaction(async (t) => {
      // Обновляем статус перемещения
      await movement.update({ 
        status: 'cancelled',
        notes: 'Рулон возвращен администратором'
      }, { transaction: t });
      
      // Возвращаем вес рулону
      const newAvailableWeight = roll.availableWeight + parseFloat(movement.quantity);
      
      await roll.update({
        availableWeight: newAvailableWeight,
        status: 'available'
      }, { transaction: t });
    });
    
    res.json({ 
      success: true, 
      message: 'Рулон возвращен в список доступных' 
    });
    
  } catch (error) {
    console.error('Ошибка при возврате рулона:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== СТАТИСТИКА ==========

app.get('/api/stats', async (req, res) => {
  try {
    const totalRolls = await Roll.count();
    const availableRolls = await Roll.count({ where: { status: 'available' } });
    
    const totalWeightResult = await Roll.sum('availableWeight');
    const totalWeight = totalWeightResult || 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayMovements = await Movement.count({
      where: {
        date: {
          [Op.gte]: today
        },
        status: 'completed'
      }
    });
    
    const totalMovements = await Movement.count();
    
    const lastMovement = await Movement.findOne({
      order: [['date', 'DESC']]
    });
    
    res.json({
      totalRolls,
      availableRolls,
      totalWeight,
      todayMovements,
      totalMovements,
      lastMovement
    });
    
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== ПОЛЬЗОВАТЕЛИ ==========

// Получить текущего пользователя
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        active: user.active,
        lastLogin: user.lastLogin
      }
    });
    
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== HEALTH CHECK ==========

app.get('/api/health', async (req, res) => {
  try {
    // Проверяем подключение к БД
    await sequelize.authenticate();
    
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      service: 'Roll Movement API',
      version: '2.0.0'
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      error: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Обработчик 404 для API
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Инициализация сервера
const startServer = async () => {
  try {
    // Инициализируем базу данных
    await initDatabase();
    
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
      console.log(`📊 База данных: SQLite (database.sqlite)`);
      console.log(`🌐 API URL: http://localhost:${PORT}/api`);
      console.log('='.repeat(50));
      console.log('🔐 Аутентификация включена');
      console.log('👑 Админ: admin / admin123');
      console.log('👷 Оператор: operator / operator123');
      console.log('='.repeat(50));
    });
    
  } catch (error) {
    console.error('❌ Не удалось запустить сервер:', error);
    process.exit(1);
  }
};

startServer();