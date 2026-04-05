require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { once } = require('events');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(express.json({ limit: '2mb' }));

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-JWT_SECRET-in-env';
if (!process.env.JWT_SECRET) {
  console.warn('ВНИМАНИЕ: JWT_SECRET не задан в .env — только для разработки.');
}

const PORT = process.env.PORT || 3000;
const BCRYPT_ROUNDS = 10;

const DEFAULT_PROMO_URLS = [
  '/1_glav/Group 54.png',
  '/1_glav/Group 55.png',
  '/1_glav/Group 56.png'
];

const UPLOAD_PROMO_DIR = path.join(__dirname, 'uploads', 'promos');
fs.mkdirSync(UPLOAD_PROMO_DIR, { recursive: true });

const promoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_PROMO_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '') || '.png';
    cb(null, `promo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  }
});
const uploadPromo = multer({
  storage: promoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_STORAGE || './dev.sqlite',
  logging: false
});

function normalizePhone(phone) {
  let d = String(phone || '').replace(/\D/g, '');
  if (d.length === 11 && d[0] === '8') d = '7' + d.slice(1);
  if (d.length === 10) d = '7' + d;
  return d;
}

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  phone: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'user' }
});

const Todo = sequelize.define('Todo', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  isDone: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
});

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  text: { type: DataTypes.TEXT, allowNull: false },
  displayDate: { type: DataTypes.STRING(40), allowNull: false }
});

const PromoSettings = sequelize.define('PromoSettings', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  image1: { type: DataTypes.TEXT, allowNull: true },
  image2: { type: DataTypes.TEXT, allowNull: true },
  image3: { type: DataTypes.TEXT, allowNull: true }
});

User.hasMany(Todo, { foreignKey: 'userId', onDelete: 'CASCADE' });
Todo.belongsTo(User, { foreignKey: 'userId' });

function userPublic(user) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    isAdmin: user.role === 'admin'
  };
}

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function requireAdmin(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ только для администратора' });
    }
    req.adminId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Сессия недействительна, войдите снова' });
  }
}

function formatReview(r) {
  return {
    id: r.id,
    name: r.name,
    text: r.text,
    date: r.displayDate
  };
}

function ruDisplayDate(d) {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}г.`;
}

// ——— API (до статики) ———

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, phone, password } = req.body || {};
    const trimmedName = String(name || '').trim();
    const phoneNorm = normalizePhone(phone);

    if (!trimmedName || trimmedName.length < 2) {
      return res.status(400).json({ error: 'Укажите имя (минимум 2 символа)' });
    }
    if (phoneNorm.length !== 11 || phoneNorm[0] !== '7') {
      return res.status(400).json({ error: 'Некорректный номер телефона' });
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({ error: 'Пароль не короче 6 символов' });
    }

    const exists = await User.findOne({ where: { phone: phoneNorm } });
    if (exists) {
      return res.status(409).json({ error: 'Пользователь с таким номером уже зарегистрирован' });
    }

    const passwordHash = await bcrypt.hash(String(password), BCRYPT_ROUNDS);
    const user = await User.create({
      phone: phoneNorm,
      name: trimmedName,
      passwordHash,
      role: 'user'
    });

    const u = userPublic(user);
    res.status(201).json({ user: u, token: signToken(user) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { name, phone, password } = req.body || {};
    const trimmedName = String(name || '').trim();
    const phoneNorm = normalizePhone(phone);

    if (!trimmedName) {
      return res.status(400).json({ error: 'Введите имя' });
    }
    if (phoneNorm.length !== 11 || phoneNorm[0] !== '7') {
      return res.status(400).json({ error: 'Некорректный номер телефона' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Введите пароль' });
    }

    const user = await User.findOne({ where: { phone: phoneNorm } });
    if (!user) {
      return res.status(401).json({ error: 'Неверный телефон или пароль' });
    }
    if (user.name.trim().toLowerCase() !== trimmedName.toLowerCase()) {
      return res.status(401).json({ error: 'Неверное имя или пароль' });
    }

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Неверный телефон или пароль' });
    }

    res.json({ user: userPublic(user), token: signToken(user) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/reviews', async (req, res) => {
  const rows = await Review.findAll({ order: [['id', 'ASC']] });
  res.json(rows.map(formatReview));
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { name, text } = req.body || {};
    const n = String(name || '').trim();
    const t = String(text || '').trim();
    if (!n || !t) {
      return res.status(400).json({ error: 'Имя и текст отзыва обязательны' });
    }
    const row = await Review.create({
      name: n,
      text: t,
      displayDate: ruDisplayDate(new Date())
    });
    res.status(201).json(formatReview(row));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/promos', async (req, res) => {
  const row = await PromoSettings.findByPk(1);
  if (!row) {
    return res.json({ urls: [...DEFAULT_PROMO_URLS] });
  }
  const urls = [
    row.image1 || DEFAULT_PROMO_URLS[0],
    row.image2 || DEFAULT_PROMO_URLS[1],
    row.image3 || DEFAULT_PROMO_URLS[2]
  ];
  res.json({ urls });
});

app.get('/api/admin/users', requireAdmin, async (req, res) => {
  const users = await User.findAll({
    attributes: ['id', 'phone', 'name', 'role', 'createdAt', 'updatedAt'],
    order: [['id', 'ASC']]
  });
  res.json(users);
});

app.get('/api/admin/reviews', requireAdmin, async (req, res) => {
  const rows = await Review.findAll({ order: [['id', 'ASC']] });
  res.json(rows.map(formatReview));
});

app.put('/api/admin/reviews/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const row = await Review.findByPk(id);
    if (!row) {
      return res.status(404).json({ error: 'Отзыв не найден' });
    }
    const { name, text, date } = req.body || {};
    const patch = {};
    if (name !== undefined) patch.name = String(name).trim();
    if (text !== undefined) patch.text = String(text).trim();
    if (date !== undefined) patch.displayDate = String(date).trim();
    if (patch.name === '') {
      return res.status(400).json({ error: 'Имя не может быть пустым' });
    }
    if (patch.text === '') {
      return res.status(400).json({ error: 'Текст не может быть пустым' });
    }
    await row.update(patch);
    res.json(formatReview(row));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/admin/reviews/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const row = await Review.findByPk(id);
  if (!row) {
    return res.status(404).json({ error: 'Отзыв не найден' });
  }
  await row.destroy();
  res.json({ ok: true });
});

app.get('/api/admin/promos', requireAdmin, async (req, res) => {
  const row = await PromoSettings.findByPk(1);
  const urls = row
    ? [
        row.image1 || DEFAULT_PROMO_URLS[0],
        row.image2 || DEFAULT_PROMO_URLS[1],
        row.image3 || DEFAULT_PROMO_URLS[2]
      ]
    : [...DEFAULT_PROMO_URLS];
  res.json({ urls });
});

app.put(
  '/api/admin/promos',
  requireAdmin,
  uploadPromo.fields([
    { name: 'image0', maxCount: 1 },
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      let row = await PromoSettings.findByPk(1);
      if (!row) {
        row = await PromoSettings.create({
          id: 1,
          image1: DEFAULT_PROMO_URLS[0],
          image2: DEFAULT_PROMO_URLS[1],
          image3: DEFAULT_PROMO_URLS[2]
        });
      }
      const next = [row.image1, row.image2, row.image3];
      for (let i = 0; i < 3; i++) {
        const file = req.files && req.files[`image${i}`] && req.files[`image${i}`][0];
        if (file) {
          next[i] = `/uploads/promos/${file.filename}`;
        }
      }
      await row.update({
        image1: next[0] || DEFAULT_PROMO_URLS[0],
        image2: next[1] || DEFAULT_PROMO_URLS[1],
        image3: next[2] || DEFAULT_PROMO_URLS[2]
      });
      await row.reload();
      res.json({
        urls: [row.image1, row.image2, row.image3]
      });
    } catch (e) {
      res.status(400).json({ error: e.message || 'Ошибка загрузки' });
    }
  }
);

app.post('/todos', async (req, res) => {
  try {
    const { userId, title } = req.body;
    const todo = await Todo.create({ userId, title });
    res.status(201).json(todo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/todos', async (req, res) => {
  const todos = await Todo.findAll({
    include: [{ model: User, attributes: ['id', 'name', 'phone', 'role'] }]
  });
  res.json(todos);
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'glav.html'));
});

const SEED_REVIEWS = [
  { name: 'Кира', displayDate: '27.03.2026г.', text: 'Лучшее место для просмотра F1 в Калининграде! Экраны огромные, звук как на трассе, бургеры — огонь. Особенно понравилась VIP-зона с симулятором. Ребята, вы лучшие!' },
  { name: 'Илья', displayDate: '19.03.2026г.', text: 'Был здесь на Гран-при Монако — это что-то с чем-то! Атмосфера как в боксах: экраны под нужным углом, звук мотора на фоне, а еда приходит быстрее, чем пит-стоп у Red Bull. Теперь только сюда!' },
  { name: 'Арина', displayDate: '22.03.2026г.', text: 'Пришли с парнем случайно, он фанат F1, а я нет. В итоге я смотрела гонку внимательнее его! Коктейль \'Шикана\' влюбил в себя. Теперь мы оба ждём следующий этап. Спасибо за вечер!' },
  { name: 'Даниил', displayDate: '10.03.2026г.', text: 'Симулятор — это имба! Чувствуешь каждый поворот. После трёх кругов вспотел как настоящий пилот. Бургер \'Поул-позишн\' съел за 40 секунд — новый рекорд! 10/10' },
  { name: 'Роман', displayDate: '05.03.2026г.', text: 'Лучшее спортивное кафе в городе. Точка. Персонал знает, кто такой Алонсо, экраны везде, еда вкусная. Даже туалеты с автогонками — мелочь, а приятно. Вернусь на следующий этап.' },
  { name: 'Сергей', displayDate: '14.03.2026г.', text: 'Пришёл посмотреть гонку, а нашёл вторую семью. Атмосфера реально своя: можно орать на обгон, и никто не осудит. Повар, если ты это читаешь — картошка фри идеальная!' }
];

async function migrateLegacySqlite() {
  const qi = sequelize.getQueryInterface();
  let exists = false;
  try {
    exists = await qi.tableExists('Users');
  } catch {
    return;
  }
  if (!exists) return;

  try {
    const desc = await qi.describeTable('Users');
    if (desc.role) return;

    await sequelize.query(
      "ALTER TABLE `Users` ADD COLUMN `role` VARCHAR(255) NOT NULL DEFAULT 'user'"
    );
    console.log('База обновлена: в таблицу Users добавлено поле role (старая схема SQLite).');
  } catch (e) {
    console.error('Миграция Users.role не удалась:', e.message);
    throw e;
  }
}

async function ensureAdminUser() {
  const phone = normalizePhone(process.env.ADMIN_PHONE || '');
  const name = (process.env.ADMIN_NAME || 'Администратор').trim();
  const pass = process.env.ADMIN_PASSWORD;

  if (!phone || phone.length !== 11 || phone[0] !== '7') {
    console.warn('В .env задайте ADMIN_PHONE (11 цифр, например 79991234567), ADMIN_NAME, ADMIN_PASSWORD — иначе админ не создаётся.');
    return;
  }
  if (!pass || String(pass).length < 6) {
    console.warn('ADMIN_PASSWORD должен быть не короче 6 символов.');
    return;
  }

  let u = await User.findOne({ where: { phone } });
  if (!u) {
    const passwordHash = await bcrypt.hash(String(pass), BCRYPT_ROUNDS);
    await User.create({ phone, name, passwordHash, role: 'admin' });
    console.log('Создана учётная запись администратора (номер из ADMIN_PHONE).');
  } else if (u.role !== 'admin') {
    await u.update({ role: 'admin' });
    console.log('Пользователь с ADMIN_PHONE назначен администратором.');
  }
}

async function seedReviewsIfEmpty() {
  const n = await Review.count();
  if (n === 0) {
    await Review.bulkCreate(SEED_REVIEWS);
  }
}

async function ensurePromoRow() {
  const row = await PromoSettings.findByPk(1);
  if (!row) {
    await PromoSettings.create({
      id: 1,
      image1: DEFAULT_PROMO_URLS[0],
      image2: DEFAULT_PROMO_URLS[1],
      image3: DEFAULT_PROMO_URLS[2]
    });
  }
}

/** If PORT is busy (old node still running), try the next ports up to +24. */
async function listenOnAvailablePort(preferredPort) {
  const start = Number(preferredPort) || 3000;
  let lastErr;
  for (let p = start; p < start + 25; p++) {
    const server = app.listen(p);
    try {
      await once(server, 'listening');
      if (p !== start) {
        console.log(`Port ${start} was busy; using ${p} instead.`);
      }
      console.log(`Server running on http://localhost:${p}`);
      return server;
    } catch (err) {
      try {
        server.close();
      } catch {
        /* ignore */
      }
      lastErr = err;
      if (err.code !== 'EADDRINUSE') {
        throw err;
      }
    }
  }
  throw lastErr || new Error('No free port found');
}

async function start() {
  await sequelize.authenticate();
  await sequelize.sync();
  await migrateLegacySqlite();

  await ensureAdminUser();
  await seedReviewsIfEmpty();
  await ensurePromoRow();

  await listenOnAvailablePort(PORT);
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
