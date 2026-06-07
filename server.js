require('dotenv').config();

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { once } = require('events');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { Sequelize, DataTypes, Op } = require('sequelize');

const app = express();
app.use(express.json({ limit: '2mb' }));

const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-jwt-secret';
const BCRYPT_ROUNDS = 10;
const LOYALTY_EARN_PERCENT = 0.05;
const LOYALTY_MAX_SPEND_PERCENT = 0.3;
const DEFAULT_PROMO_URLS = ['/1_glav/Group 54.png', '/1_glav/Group 55.png', '/1_glav/Group 56.png'];

function isWritableDir(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
    const probe = path.join(dir, `.write-test-${process.pid}`);
    fs.writeFileSync(probe, 'ok');
    fs.unlinkSync(probe);
    return true;
  } catch {
    return false;
  }
}

function resolveStorageRoot() {
  const configured = process.env.STORAGE_ROOT || process.env.DATA_DIR;
  const candidates = [
    configured,
    path.join(__dirname, '.data'),
    path.join(os.tmpdir(), 'pitstop')
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (isWritableDir(candidate)) return candidate;
  }

  throw new Error(`No writable storage directory found. Tried: ${candidates.join(', ')}`);
}

const STORAGE_ROOT = resolveStorageRoot();
const DB_STORAGE = process.env.DB_STORAGE || path.join(STORAGE_ROOT, 'dev.sqlite');
const UPLOAD_ROOT = process.env.UPLOAD_ROOT || path.join(STORAGE_ROOT, 'uploads');

// Папки для загрузки
const UPLOAD_PROMO_DIR = path.join(UPLOAD_ROOT, 'promos');
const UPLOAD_GP_DIR = path.join(UPLOAD_ROOT, 'gp');
const UPLOAD_NEWS_DIR = path.join(UPLOAD_ROOT, 'news');
fs.mkdirSync(UPLOAD_PROMO_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_GP_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_NEWS_DIR, { recursive: true });

// Настройки multer
const promoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_PROMO_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '') || '.png';
    cb(null, `promo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  }
});

const gpStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_GP_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '') || '.png';
    cb(null, `gp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  }
});

const newsStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_NEWS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '') || '.png';
    cb(null, `news-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  }
});

const uploadPromo = multer({ storage: promoStorage, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadGp = multer({ storage: gpStorage, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadNews = multer({ storage: newsStorage, limits: { fileSize: 5 * 1024 * 1024 } });

// База данных
const sequelize = new Sequelize({ dialect: 'sqlite', storage: DB_STORAGE, logging: false });

// Модели
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  phone: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'user' },
  loyaltyPoints: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
});

const MenuCategory = sequelize.define('MenuCategory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  slug: { type: DataTypes.STRING(40), unique: true, allowNull: false },
  title: { type: DataTypes.STRING(80), allowNull: false }
});

const MenuItem = sequelize.define('MenuItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING(64), unique: true, allowNull: false },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  price: { type: DataTypes.INTEGER, allowNull: false },
  imageUrl: { type: DataTypes.STRING(300), allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
});

const Cart = sequelize.define('Cart', { id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true } });
const CartItem = sequelize.define('CartItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  selected: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
});

const TableBooking = sequelize.define('TableBooking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tableNumber: { type: DataTypes.INTEGER, allowNull: false },
  guests: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 2 },
  bookingAt: { type: DataTypes.DATE, allowNull: false },
  comment: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'pending' }
});

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
  tableNumber: { type: DataTypes.INTEGER, allowNull: true },
  subtotal: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  loyaltySpent: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  total: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
});

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  titleSnapshot: { type: DataTypes.STRING(200), allowNull: false },
  unitPrice: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }
});

const PaymentMethod = sequelize.define('PaymentMethod', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  brand: { type: DataTypes.STRING(20), allowNull: false },
  maskedPan: { type: DataTypes.STRING(30), allowNull: false },
  token: { type: DataTypes.STRING(80), allowNull: false },
  expMonth: { type: DataTypes.INTEGER, allowNull: false },
  expYear: { type: DataTypes.INTEGER, allowNull: false },
  isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
});

const PaymentAttempt = sequelize.define('PaymentAttempt', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  amount: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'success' },
  cardBrand: { type: DataTypes.STRING(20), allowNull: false },
  cardMaskedPan: { type: DataTypes.STRING(30), allowNull: false }
});

const LoyaltyTransaction = sequelize.define('LoyaltyTransaction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type: { type: DataTypes.STRING(10), allowNull: false },
  points: { type: DataTypes.INTEGER, allowNull: false },
  reason: { type: DataTypes.STRING(100), allowNull: false }
});

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  text: { type: DataTypes.TEXT, allowNull: false },
  displayDate: { type: DataTypes.STRING(40), allowNull: false }
});

const PromoBanner = sequelize.define('PromoBanner', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  image1: { type: DataTypes.TEXT, allowNull: true },
  image2: { type: DataTypes.TEXT, allowNull: true },
  image3: { type: DataTypes.TEXT, allowNull: true }
});

// НОВЫЕ МОДЕЛИ
const GpSettings = sequelize.define('GpSettings', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Майами, США' },
  round: { type: DataTypes.INTEGER, defaultValue: 4 },
  startDate: { type: DataTypes.DATE, allowNull: true },
  flagUrl: { type: DataTypes.STRING, allowNull: true },
  backgroundUrl: { type: DataTypes.STRING, allowNull: true }
});

const News = sequelize.define('News', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  date: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  excerpt: { type: DataTypes.TEXT, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: true }
});

const ChatSession = sequelize.define('ChatSession', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  publicId: { type: DataTypes.STRING(36), unique: true, allowNull: false },
  pageUrl: { type: DataTypes.STRING(300), allowNull: true }
});

const ChatMessage = sequelize.define('ChatMessage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  role: { type: DataTypes.STRING(20), allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  pageUrl: { type: DataTypes.STRING(300), allowNull: true }
});

const { chatCompletion } = require('./services/gigachat');
const { buildSystemPrompt } = require('./services/chat-context');

// Связи
MenuCategory.hasMany(MenuItem, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
MenuItem.belongsTo(MenuCategory, { foreignKey: 'categoryId' });
User.hasOne(Cart, { foreignKey: 'userId', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'userId' });
Cart.hasMany(CartItem, { foreignKey: 'cartId', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });
MenuItem.hasMany(CartItem, { foreignKey: 'menuItemId' });
CartItem.belongsTo(MenuItem, { foreignKey: 'menuItemId' });
User.hasMany(TableBooking, { foreignKey: 'userId', onDelete: 'CASCADE' });
TableBooking.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
MenuItem.hasMany(OrderItem, { foreignKey: 'menuItemId' });
OrderItem.belongsTo(MenuItem, { foreignKey: 'menuItemId' });
User.hasMany(PaymentMethod, { foreignKey: 'userId', onDelete: 'CASCADE' });
PaymentMethod.belongsTo(User, { foreignKey: 'userId' });
PaymentMethod.hasMany(PaymentAttempt, { foreignKey: 'paymentMethodId' });
PaymentAttempt.belongsTo(PaymentMethod, { foreignKey: 'paymentMethodId' });
Order.hasMany(PaymentAttempt, { foreignKey: 'orderId', onDelete: 'CASCADE' });
PaymentAttempt.belongsTo(Order, { foreignKey: 'orderId' });
User.hasMany(LoyaltyTransaction, { foreignKey: 'userId', onDelete: 'CASCADE' });
LoyaltyTransaction.belongsTo(User, { foreignKey: 'userId' });
Order.hasMany(LoyaltyTransaction, { foreignKey: 'orderId' });
LoyaltyTransaction.belongsTo(Order, { foreignKey: 'orderId' });
User.hasMany(Review, { foreignKey: 'userId', onDelete: 'SET NULL' });
Review.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(ChatSession, { foreignKey: 'userId', onDelete: 'SET NULL' });
ChatSession.belongsTo(User, { foreignKey: 'userId' });
ChatSession.hasMany(ChatMessage, { foreignKey: 'sessionId', onDelete: 'CASCADE' });
ChatMessage.belongsTo(ChatSession, { foreignKey: 'sessionId' });

// Вспомогательные функции
function normalizePhone(phone) {
  let d = String(phone || '').replace(/\D/g, '');
  if (d.length === 11 && d[0] === '8') d = '7' + d.slice(1);
  if (d.length === 10) d = '7' + d;
  return d;
}

function formatPhoneRu(phone) {
  const d = normalizePhone(phone);
  if (d.length === 11 && d[0] === '7') return `+7 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
  return phone || '';
}

function userPublic(user) {
  return { id: user.id, name: user.name, phone: user.phone, phoneDisplay: formatPhoneRu(user.phone), isAdmin: user.role === 'admin', loyaltyPoints: user.loyaltyPoints };
}

function signToken(user) { return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' }); }
function getToken(req) { const h = req.headers.authorization || ''; return h.startsWith('Bearer ') ? h.slice(7) : null; }

async function requireAuth(req, res, next) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(payload.sub);
    if (!user) return res.status(401).json({ error: 'Пользователь не найден' });
    req.user = user;
    req.jwt = payload;
    next();
  } catch { res.status(401).json({ error: 'Сессия недействительна, войдите снова' }); }
}

async function optionalAuth(req, _res, next) {
  const token = getToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(payload.sub);
    if (user) req.user = user;
  } catch { /* гость */ }
  next();
}

async function getOrCreateChatSession(publicId, userId, pageUrl) {
  if (publicId) {
    const existing = await ChatSession.findOne({ where: { publicId } });
    if (existing) {
      if (userId && !existing.userId) await existing.update({ userId });
      if (pageUrl && existing.pageUrl !== pageUrl) await existing.update({ pageUrl });
      return existing;
    }
  }
  return ChatSession.create({
    publicId: publicId || crypto.randomUUID(),
    userId: userId || null,
    pageUrl: pageUrl || null
  });
}

async function getUserBookingsForChat(userId) {
  if (!userId) return [];
  return TableBooking.findAll({
    where: { userId, status: { [Op.in]: ['pending', 'approved'] } },
    order: [['bookingAt', 'ASC']],
    limit: 10
  });
}

function normalizeChatMessage(row) {
  return { id: row.id, role: row.role, content: row.content, pageUrl: row.pageUrl, createdAt: row.createdAt };
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Доступ только для администратора' });
  next();
}

function ruDisplayDate(d) { return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}г.`; }

function detectCardBrand(pan) {
  if (/^4\d{12}(\d{3})?$/.test(pan)) return 'visa';
  if (/^5[1-5]\d{14}$/.test(pan)) return 'mastercard';
  if (/^2(2[2-9]|[3-7]\d)\d{12}$/.test(pan)) return 'mastercard';
  if (/^220[0-4]\d{12}$/.test(pan)) return 'mir';
  if (/^3[47]\d{13}$/.test(pan)) return 'amex';
  return 'unknown';
}

function luhnValid(pan) {
  let sum = 0, dbl = false;
  for (let i = pan.length - 1; i >= 0; i--) {
    let n = Number(pan[i]);
    if (dbl) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

function validateCardInput({ cardNumber, expiryMonth, expiryYear, cvc }) {
  const pan = String(cardNumber || '').replace(/\D/g, '');
  const mm = Number(expiryMonth);
  const yy = Number(expiryYear);
  const cv = String(cvc || '').replace(/\D/g, '');
  if (pan.length < 13 || pan.length > 19 || !luhnValid(pan)) return { ok: false, error: 'Некорректный номер карты' };
  if (!Number.isInteger(mm) || mm < 1 || mm > 12) return { ok: false, error: 'Некорректный месяц карты' };
  if (!Number.isInteger(yy) || yy < 2024 || yy > 2100) return { ok: false, error: 'Некорректный год карты' };
  if (cv.length < 3 || cv.length > 4) return { ok: false, error: 'Некорректный CVC' };
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (yy < currentYear || (yy === currentYear && mm < currentMonth)) return { ok: false, error: 'Карта просрочена' };
  const brand = detectCardBrand(pan);
  if (brand === 'unknown') return { ok: false, error: 'Неизвестный тип карты' };
  const maskedPan = `${'*'.repeat(Math.max(0, pan.length - 4))}${pan.slice(-4)}`.replace(/(.{4})/g, '$1 ').trim();
  const token = crypto.createHash('sha256').update(`${pan}:${mm}:${yy}`).digest('hex').slice(0, 48);
  return { ok: true, pan, brand, maskedPan, token, expMonth: mm, expYear: yy };
}

async function getOrCreateCart(userId) { let cart = await Cart.findOne({ where: { userId } }); if (!cart) cart = await Cart.create({ userId }); return cart; }

async function cartPayload(userId) {
  const cart = await getOrCreateCart(userId);
  const items = await CartItem.findAll({ where: { cartId: cart.id }, include: [{ model: MenuItem }] });
  const normalized = items.filter(i => i.MenuItem && i.MenuItem.isActive).map(i => ({
    id: i.id, menuItemId: i.menuItemId, title: i.MenuItem.title, price: i.MenuItem.price,
    quantity: i.quantity, selected: i.selected, imageUrl: i.MenuItem.imageUrl
  }));
  const subtotal = normalized.reduce((s, i) => s + i.price * i.quantity, 0);
  const selectedTotal = normalized.filter(i => i.selected).reduce((s, i) => s + i.price * i.quantity, 0);
  return { id: cart.id, items: normalized, subtotal, selectedTotal };
}

function normalizeReview(row) { return { id: row.id, name: row.name, text: row.text, date: row.displayDate }; }

const MENU_SEED = [
  { code: 'burger_senna', title: 'Бургер "Айртон Сенна"', price: 550, category: 'food' },
  { code: 'burger_schumacher', title: 'Бургер "Михаэль Шумахер"', price: 620, category: 'food' },
  { code: 'pizza_monaco', title: 'Пицца "Монако"', price: 780, category: 'food' },
  { code: 'steak_pilot', title: 'Стейк пилота', price: 890, category: 'food' },
  { code: 'snack_wings', title: 'Крылья BBQ', price: 390, category: 'snacks' },
  { code: 'snack_cheese', title: 'Сырная тарелка', price: 790, category: 'snacks' },
  { code: 'limo_eaurouge', title: 'Лимонад Eau Rouge', price: 280, category: 'drinks' },
  { code: 'shake_hamilton', title: 'Коктейль Хэмилтон', price: 340, category: 'drinks' },
  { code: 'coffee_americano', title: 'Американо', price: 190, category: 'drinks' },
  { code: 'tea_assam', title: 'Чай Ассам', price: 170, category: 'drinks' }
];

const REVIEW_SEED = [
  { name: 'Кира', displayDate: '27.03.2026г.', text: 'Лучшее место для просмотра F1 в Калининграде! Атмосфера и еда топ.' },
  { name: 'Илья', displayDate: '19.03.2026г.', text: 'Прихожу на каждый Гран-при. Отличные экраны, быстрый сервис.' }
];

async function ensureAdminUser() {
  const phone = normalizePhone(process.env.ADMIN_PHONE || '');
  const name = String(process.env.ADMIN_NAME || 'Администратор').trim();
  const pass = process.env.ADMIN_PASSWORD || '';
  if (!phone || phone.length !== 11 || phone[0] !== '7' || pass.length < 6) return;
  let user = await User.findOne({ where: { phone } });
  const passwordHash = await bcrypt.hash(pass, BCRYPT_ROUNDS);
  if (!user) user = await User.create({ phone, name, passwordHash, role: 'admin' });
  else await user.update({ role: 'admin', name, passwordHash });
}

async function seedSystemData() {
  const catBySlug = {};
  for (const c of [{ slug: 'food', title: 'Еда' }, { slug: 'snacks', title: 'Закуски' }, { slug: 'drinks', title: 'Напитки' }]) {
    const [cat] = await MenuCategory.findOrCreate({ where: { slug: c.slug }, defaults: c });
    catBySlug[c.slug] = cat;
  }
  for (const item of MENU_SEED) {
    const category = catBySlug[item.category];
    const existing = await MenuItem.findOne({ where: { code: item.code } });
    if (!existing) await MenuItem.create({ code: item.code, title: item.title, description: item.title, price: item.price, categoryId: category.id, imageUrl: null });
  }
  const reviewCount = await Review.count();
  if (reviewCount === 0) await Review.bulkCreate(REVIEW_SEED);
  const promo = await PromoBanner.findByPk(1);
  if (!promo) await PromoBanner.create({ id: 1, image1: DEFAULT_PROMO_URLS[0], image2: DEFAULT_PROMO_URLS[1], image3: DEFAULT_PROMO_URLS[2] });
  const gpSettings = await GpSettings.findByPk(1);
  if (!gpSettings) await GpSettings.create({ id: 1, name: 'Майами, США', round: 4, startDate: null });
}

// ========== ПУБЛИЧНЫЕ ЭНДПОИНТЫ ==========
app.get('/health', (_req, res) => { res.json({ ok: true }); });

app.post('/api/auth/register', async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const phone = normalizePhone(req.body?.phone || '');
    const password = String(req.body?.password || '');
    if (name.length < 2) return res.status(400).json({ error: 'Имя должно быть не короче 2 символов' });
    if (phone.length !== 11 || phone[0] !== '7') return res.status(400).json({ error: 'Некорректный номер телефона' });
    if (password.length < 6) return res.status(400).json({ error: 'Пароль не короче 6 символов' });
    const existing = await User.findOne({ where: { phone } });
    if (existing) return res.status(409).json({ error: 'Пользователь с таким номером уже зарегистрирован' });
    const user = await User.create({ name, phone, passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS), role: 'user' });
    await getOrCreateCart(user.id);
    res.status(201).json({ user: userPublic(user), token: signToken(user) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const phone = normalizePhone(req.body?.phone || '');
    const password = String(req.body?.password || '');
    const user = await User.findOne({ where: { phone } });
    if (!user) return res.status(401).json({ error: 'Неверные данные для входа' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Неверные данные для входа' });
    await getOrCreateCart(user.id);
    res.json({ user: userPublic(user), token: signToken(user) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/auth/me', requireAuth, async (req, res) => { await req.user.reload(); res.json({ user: userPublic(req.user) }); });
app.get('/api/menu/categories', async (_req, res) => { const categories = await MenuCategory.findAll({ order: [['id', 'ASC']] }); res.json(categories); });
app.get('/api/menu/items', async (req, res) => { const where = { isActive: true }; if (req.query.category) { const cat = await MenuCategory.findOne({ where: { slug: String(req.query.category) } }); if (!cat) return res.json([]); where.categoryId = cat.id; } const items = await MenuItem.findAll({ where, include: [{ model: MenuCategory }], order: [['id', 'ASC']] }); res.json(items); });
app.get('/api/cart', requireAuth, async (req, res) => { res.json(await cartPayload(req.user.id)); });
app.post('/api/cart/items', requireAuth, async (req, res) => { const menuItemId = Number(req.body?.menuItemId); const quantity = Math.max(1, Number(req.body?.quantity || 1)); if (!menuItemId) return res.status(400).json({ error: 'menuItemId обязателен' }); const menuItem = await MenuItem.findByPk(menuItemId); if (!menuItem || !menuItem.isActive) return res.status(404).json({ error: 'Позиция не найдена' }); const cart = await getOrCreateCart(req.user.id); let item = await CartItem.findOne({ where: { cartId: cart.id, menuItemId } }); if (!item) item = await CartItem.create({ cartId: cart.id, menuItemId, quantity, selected: true }); else await item.update({ quantity: item.quantity + quantity }); res.json(await cartPayload(req.user.id)); });
app.post('/api/cart/items/custom', requireAuth, async (req, res) => { const title = String(req.body?.title || '').trim(); const price = Number(req.body?.price || 0); const quantity = Math.max(1, Number(req.body?.quantity || 1)); const imageUrl = req.body?.imageUrl ? String(req.body.imageUrl).trim() : null; if (!title || !price) return res.status(400).json({ error: 'title и price обязательны' }); const customCode = `custom_${title.toLowerCase().replace(/[^a-zа-я0-9]+/gi, '_')}`; const [category] = await MenuCategory.findOrCreate({ where: { slug: 'custom' }, defaults: { slug: 'custom', title: 'Кастомные позиции' } }); let menuItem = await MenuItem.findOne({ where: { code: customCode } }); if (!menuItem) { menuItem = await MenuItem.create({ code: customCode, title, description: title, price, categoryId: category.id, imageUrl: imageUrl || null, isActive: true }); } else if (!menuItem.imageUrl && imageUrl) { await menuItem.update({ imageUrl }); } const cart = await getOrCreateCart(req.user.id); let item = await CartItem.findOne({ where: { cartId: cart.id, menuItemId: menuItem.id } }); if (!item) item = await CartItem.create({ cartId: cart.id, menuItemId: menuItem.id, quantity, selected: true }); else await item.update({ quantity: item.quantity + quantity }); res.json(await cartPayload(req.user.id)); });
app.put('/api/cart/items/:id', requireAuth, async (req, res) => { const id = Number(req.params.id); const item = await CartItem.findByPk(id, { include: [{ model: Cart }] }); if (!item || !item.Cart || item.Cart.userId !== req.user.id) return res.status(404).json({ error: 'Элемент корзины не найден' }); const patch = {}; if (req.body?.quantity !== undefined) patch.quantity = Math.max(1, Number(req.body.quantity)); if (req.body?.selected !== undefined) patch.selected = Boolean(req.body.selected); await item.update(patch); res.json(await cartPayload(req.user.id)); });
app.delete('/api/cart/items/:id', requireAuth, async (req, res) => { const id = Number(req.params.id); const item = await CartItem.findByPk(id, { include: [{ model: Cart }] }); if (!item || !item.Cart || item.Cart.userId !== req.user.id) return res.status(404).json({ error: 'Элемент корзины не найден' }); await item.destroy(); res.json(await cartPayload(req.user.id)); });
app.post('/api/bookings', requireAuth, async (req, res) => { try { const tableNumber = Number(req.body?.tableNumber); const guests = Math.max(1, Number(req.body?.guests || 2)); const bookingAt = new Date(req.body?.bookingAt || ''); const comment = String(req.body?.comment || ''); if (!Number.isInteger(tableNumber) || tableNumber < 1 || tableNumber > 999) return res.status(400).json({ error: 'Некорректный номер столика' }); if (!(bookingAt instanceof Date) || Number.isNaN(bookingAt.getTime())) return res.status(400).json({ error: 'Некорректная дата брони' }); const exists = await TableBooking.findOne({ where: { tableNumber, status: { [Op.in]: ['pending', 'approved'] }, bookingAt: { [Op.between]: [new Date(bookingAt.getTime() - 60 * 60 * 1000), new Date(bookingAt.getTime() + 60 * 60 * 1000)] } } }); if (exists) return res.status(409).json({ error: 'Этот столик уже занят на выбранное время' }); const booking = await TableBooking.create({ userId: req.user.id, tableNumber, guests, bookingAt, comment, status: 'pending' }); res.status(201).json(booking); } catch (e) { res.status(400).json({ error: e.message }); } });
app.get('/api/bookings/my', requireAuth, async (req, res) => { const bookings = await TableBooking.findAll({ where: { userId: req.user.id }, order: [['bookingAt', 'DESC']] }); res.json(bookings); });
app.patch('/api/bookings/:id/cancel', requireAuth, async (req, res) => { const booking = await TableBooking.findByPk(Number(req.params.id)); if (!booking || booking.userId !== req.user.id) return res.status(404).json({ error: 'Бронь не найдена' }); await booking.update({ status: 'cancelled' }); res.json(booking); });
app.post('/api/orders/checkout', requireAuth, async (req, res) => { const useLoyaltyPoints = Number(req.body?.useLoyaltyPoints || 0); const tableNumber = req.body?.tableNumber ? Number(req.body.tableNumber) : null; const cardInput = { cardNumber: req.body?.cardNumber, expiryMonth: req.body?.expiryMonth, expiryYear: req.body?.expiryYear, cvc: req.body?.cvc }; const validation = validateCardInput(cardInput); if (!validation.ok) return res.status(400).json({ error: validation.error }); const cart = await cartPayload(req.user.id); const selected = cart.items.filter((i) => i.selected); if (selected.length === 0) return res.status(400).json({ error: 'В корзине нет выбранных товаров' }); const subtotal = selected.reduce((s, i) => s + i.price * i.quantity, 0); const maxAllowed = Math.floor(subtotal * LOYALTY_MAX_SPEND_PERCENT); const pointsToSpend = Math.min(Math.max(0, useLoyaltyPoints), req.user.loyaltyPoints, maxAllowed); const total = subtotal - pointsToSpend; const earned = Math.floor(total * LOYALTY_EARN_PERCENT); const tx = await sequelize.transaction(); try { const order = await Order.create({ userId: req.user.id, status: 'active', tableNumber, subtotal, loyaltySpent: pointsToSpend, total }, { transaction: tx }); for (const item of selected) { await OrderItem.create({ orderId: order.id, menuItemId: item.menuItemId, titleSnapshot: item.title, unitPrice: item.price, quantity: item.quantity }, { transaction: tx }); } await PaymentMethod.update({ isDefault: false }, { where: { userId: req.user.id }, transaction: tx }); const method = await PaymentMethod.create({ userId: req.user.id, brand: validation.brand, maskedPan: validation.maskedPan, token: validation.token, expMonth: validation.expMonth, expYear: validation.expYear, isDefault: true }, { transaction: tx }); await PaymentAttempt.create({ orderId: order.id, paymentMethodId: method.id, amount: total, status: 'success', cardBrand: validation.brand, cardMaskedPan: validation.maskedPan }, { transaction: tx }); if (pointsToSpend > 0) { await LoyaltyTransaction.create({ userId: req.user.id, orderId: order.id, type: 'spend', points: pointsToSpend, reason: 'Оплата заказа' }, { transaction: tx }); } if (earned > 0) { await LoyaltyTransaction.create({ userId: req.user.id, orderId: order.id, type: 'earn', points: earned, reason: 'Кэшбэк за заказ' }, { transaction: tx }); } await User.update({ loyaltyPoints: req.user.loyaltyPoints - pointsToSpend + earned }, { where: { id: req.user.id }, transaction: tx }); const cartModel = await getOrCreateCart(req.user.id); await CartItem.destroy({ where: { cartId: cartModel.id, selected: true }, transaction: tx }); await tx.commit(); await req.user.reload(); res.status(201).json({ orderId: order.id, total, subtotal, loyaltySpent: pointsToSpend, loyaltyEarned: earned, loyaltyBalance: req.user.loyaltyPoints }); } catch (e) { await tx.rollback(); res.status(400).json({ error: e.message }); } });
app.get('/api/orders/my', requireAuth, async (req, res) => { const orders = await Order.findAll({ where: { userId: req.user.id }, include: [{ model: OrderItem }], order: [['id', 'DESC']] }); res.json(orders); });
app.get('/api/loyalty/balance', requireAuth, async (req, res) => { await req.user.reload(); res.json({ points: req.user.loyaltyPoints }); });
app.get('/api/loyalty/transactions', requireAuth, async (req, res) => { const txs = await LoyaltyTransaction.findAll({ where: { userId: req.user.id }, order: [['id', 'DESC']] }); res.json(txs); });
app.get('/api/profile', requireAuth, async (req, res) => { const [bookings, orders, paymentMethods, loyalty] = await Promise.all([ TableBooking.findAll({ where: { userId: req.user.id }, order: [['bookingAt', 'DESC']] }), Order.findAll({ where: { userId: req.user.id }, include: [{ model: OrderItem }], order: [['id', 'DESC']], limit: 20 }), PaymentMethod.findAll({ where: { userId: req.user.id }, attributes: ['id', 'brand', 'maskedPan', 'expMonth', 'expYear', 'isDefault'] }), LoyaltyTransaction.findAll({ where: { userId: req.user.id }, order: [['id', 'DESC']], limit: 20 }) ]); await req.user.reload(); res.json({ user: userPublic(req.user), bookings, orders, paymentMethods, loyalty }); });
app.get('/api/reviews', async (_req, res) => { try { const rows = await Review.findAll({ order: [['id', 'ASC']] }); res.json(rows.map(normalizeReview)); } catch (e) { res.status(500).json({ error: e.message }); } });
app.post('/api/reviews', requireAuth, async (req, res) => { const text = String(req.body?.text || '').trim(); const name = String(req.body?.name || req.user.name).trim() || req.user.name; if (!text) return res.status(400).json({ error: 'Введите текст отзыва' }); const row = await Review.create({ userId: req.user.id, name, text, displayDate: ruDisplayDate(new Date()) }); res.status(201).json(normalizeReview(row)); });
app.get('/api/promos', async (_req, res) => { const row = await PromoBanner.findByPk(1); if (!row) return res.json({ urls: [...DEFAULT_PROMO_URLS] }); res.json({ urls: [row.image1 || DEFAULT_PROMO_URLS[0], row.image2 || DEFAULT_PROMO_URLS[1], row.image3 || DEFAULT_PROMO_URLS[2]] }); });

// ========== ЧАТ-ПОМОЩНИК (GigaChat) ==========
app.get('/api/chat/history', optionalAuth, async (req, res) => {
  try {
    const publicId = String(req.query.sessionId || '').trim();
    if (!publicId) return res.json({ messages: [] });
    const session = await ChatSession.findOne({ where: { publicId } });
    if (!session) return res.json({ messages: [] });
    if (req.user && session.userId && session.userId !== req.user.id) {
      return res.status(403).json({ error: 'Нет доступа к этой сессии' });
    }
    const messages = await ChatMessage.findAll({
      where: { sessionId: session.id, role: { [Op.in]: ['user', 'assistant'] } },
      order: [['id', 'ASC']],
      limit: 40
    });
    res.json({ sessionId: session.publicId, messages: messages.map(normalizeChatMessage) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/chat', optionalAuth, async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim();
    const pageUrl = String(req.body?.pageUrl || '').slice(0, 300);
    let publicId = String(req.body?.sessionId || '').trim();
    if (!message) return res.status(400).json({ error: 'Введите сообщение' });
    if (message.length > 2000) return res.status(400).json({ error: 'Слишком длинное сообщение' });

    const session = await getOrCreateChatSession(publicId, req.user?.id, pageUrl);
    publicId = session.publicId;

    await ChatMessage.create({
      sessionId: session.id,
      role: 'user',
      content: message,
      pageUrl: pageUrl || null
    });

    const history = await ChatMessage.findAll({
      where: { sessionId: session.id, role: { [Op.in]: ['user', 'assistant'] } },
      order: [['id', 'ASC']],
      limit: 20
    });

    const bookings = req.user ? await getUserBookingsForChat(req.user.id) : [];
    const systemPrompt = buildSystemPrompt({
      user: req.user ? userPublic(req.user) : null,
      bookings
    });

    const gigaMessages = [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content }))
    ];

    let reply;
    try {
      reply = await chatCompletion(gigaMessages);
    } catch (err) {
      console.error('GigaChat error:', err.message);
      reply = 'Сейчас не могу связаться с ассистентом. По бронированию: откройте bron.html, войдите в аккаунт и выберите сессию гонки на схеме зала. Меню — в разделах eda.html, napitki.html, zackus.html.';
    }

    await ChatMessage.create({
      sessionId: session.id,
      role: 'assistant',
      content: reply,
      pageUrl: pageUrl || null
    });

    res.json({ sessionId: publicId, reply });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========== АДМИН-ЭНДПОИНТЫ ==========
app.get('/api/admin/users', requireAuth, requireAdmin, async (_req, res) => { const users = await User.findAll({ attributes: ['id', 'name', 'phone', 'role', 'loyaltyPoints', 'createdAt'], order: [['id', 'ASC']] }); res.json(users); });
app.get('/api/admin/orders', requireAuth, requireAdmin, async (_req, res) => { const orders = await Order.findAll({ include: [{ model: User, attributes: ['id', 'name', 'phone'] }, { model: OrderItem }], order: [['id', 'DESC']], limit: 100 }); res.json(orders); });
app.patch('/api/admin/orders/:id/status', requireAuth, requireAdmin, async (req, res) => { const order = await Order.findByPk(Number(req.params.id)); if (!order) return res.status(404).json({ error: 'Заказ не найден' }); const status = String(req.body?.status || ''); if (!['active', 'ready', 'completed'].includes(status)) return res.status(400).json({ error: 'Некорректный статус' }); await order.update({ status }); res.json(order); });
app.get('/api/admin/bookings', requireAuth, requireAdmin, async (_req, res) => { const bookings = await TableBooking.findAll({ include: [{ model: User, attributes: ['id', 'name', 'phone'] }], order: [['bookingAt', 'DESC']], limit: 100 }); res.json(bookings); });
app.patch('/api/admin/bookings/:id', requireAuth, requireAdmin, async (req, res) => { const booking = await TableBooking.findByPk(Number(req.params.id)); if (!booking) return res.status(404).json({ error: 'Бронь не найдена' }); const status = String(req.body?.status || ''); if (!['pending', 'approved', 'rejected', 'cancelled'].includes(status)) return res.status(400).json({ error: 'Некорректный статус' }); await booking.update({ status }); res.json(booking); });
app.get('/api/admin/reviews', requireAuth, requireAdmin, async (_req, res) => { const rows = await Review.findAll({ order: [['id', 'ASC']] }); res.json(rows.map(normalizeReview)); });
app.post('/api/admin/reviews', requireAuth, requireAdmin, async (req, res) => { const { name, text, date } = req.body; const review = await Review.create({ name, text, displayDate: date }); res.status(201).json(normalizeReview(review)); });
app.put('/api/admin/reviews/:id', requireAuth, requireAdmin, async (req, res) => { const row = await Review.findByPk(Number(req.params.id)); if (!row) return res.status(404).json({ error: 'Отзыв не найден' }); const patch = {}; if (req.body?.name !== undefined) patch.name = String(req.body.name).trim(); if (req.body?.text !== undefined) patch.text = String(req.body.text).trim(); if (req.body?.date !== undefined) patch.displayDate = String(req.body.date).trim(); await row.update(patch); res.json(normalizeReview(row)); });
app.delete('/api/admin/reviews/:id', requireAuth, requireAdmin, async (req, res) => { const row = await Review.findByPk(Number(req.params.id)); if (!row) return res.status(404).json({ error: 'Отзыв не найден' }); await row.destroy(); res.json({ ok: true }); });
app.get('/api/admin/promos', requireAuth, requireAdmin, async (_req, res) => { const row = await PromoBanner.findByPk(1); if (!row) return res.json({ urls: [...DEFAULT_PROMO_URLS] }); res.json({ urls: [row.image1, row.image2, row.image3] }); });
app.put('/api/admin/promos', requireAuth, requireAdmin, uploadPromo.fields([{ name: 'image0', maxCount: 1 }, { name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]), async (req, res) => { let row = await PromoBanner.findByPk(1); if (!row) row = await PromoBanner.create({ id: 1, image1: DEFAULT_PROMO_URLS[0], image2: DEFAULT_PROMO_URLS[1], image3: DEFAULT_PROMO_URLS[2] }); const next = [row.image1, row.image2, row.image3]; for (let i = 0; i < 3; i++) { const file = req.files && req.files[`image${i}`] && req.files[`image${i}`][0]; if (file) next[i] = `/uploads/promos/${file.filename}`; } await row.update({ image1: next[0], image2: next[1], image3: next[2] }); res.json({ urls: [row.image1, row.image2, row.image3] }); });

// ========== НОВЫЕ АДМИН-ЭНДПОИНТЫ ==========
app.get('/api/admin/gp-settings', requireAuth, requireAdmin, async (_req, res) => { let settings = await GpSettings.findByPk(1); if (!settings) settings = await GpSettings.create({ id: 1 }); res.json(settings); });
app.put('/api/admin/gp-settings', requireAuth, requireAdmin, uploadGp.fields([{ name: 'flag', maxCount: 1 }, { name: 'background', maxCount: 1 }]), async (req, res) => { let settings = await GpSettings.findByPk(1); if (!settings) settings = await GpSettings.create({ id: 1 }); const updates = {}; if (req.body.name !== undefined) updates.name = req.body.name; if (req.body.round !== undefined) updates.round = parseInt(req.body.round); if (req.body.startDate !== undefined && req.body.startDate) updates.startDate = new Date(req.body.startDate); if (req.files?.flag?.[0]) updates.flagUrl = `/uploads/gp/${req.files.flag[0].filename}`; if (req.files?.background?.[0]) updates.backgroundUrl = `/uploads/gp/${req.files.background[0].filename}`; await settings.update(updates); res.json(settings); });
app.get('/api/admin/news', requireAuth, requireAdmin, async (_req, res) => { const news = await News.findAll({ order: [['id', 'DESC']] }); res.json(news); });
app.post('/api/admin/news', requireAuth, requireAdmin, async (req, res) => { const { date, title, excerpt, image } = req.body; const news = await News.create({ date, title, excerpt, image: image || null }); res.status(201).json(news); });
app.put('/api/admin/news/:id', requireAuth, requireAdmin, uploadNews.single('image'), async (req, res) => { const news = await News.findByPk(Number(req.params.id)); if (!news) return res.status(404).json({ error: 'Новость не найдена' }); const { date, title, excerpt } = req.body; let image = news.image; if (req.file) image = `/uploads/news/${req.file.filename}`; await news.update({ date, title, excerpt, image }); res.json(news); });
app.delete('/api/admin/news/:id', requireAuth, requireAdmin, async (req, res) => { const news = await News.findByPk(Number(req.params.id)); if (!news) return res.status(404).json({ error: 'Новость не найдена' }); await news.destroy(); res.json({ ok: true }); });

app.get('/api/admin/chat', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const userMessages = await ChatMessage.findAll({
      where: { role: 'user' },
      include: [{
        model: ChatSession,
        include: [{ model: User, attributes: ['id', 'name', 'phone'] }]
      }],
      order: [['id', 'DESC']],
      limit: 150
    });

    const items = [];
    for (const userMsg of userMessages) {
      const assistantMsg = await ChatMessage.findOne({
        where: {
          sessionId: userMsg.sessionId,
          role: 'assistant',
          id: { [Op.gt]: userMsg.id }
        },
        order: [['id', 'ASC']]
      });
      const session = userMsg.ChatSession;
      const u = session?.User;
      items.push({
        id: userMsg.id,
        sessionId: session?.publicId || '',
        userName: u ? u.name : 'Гость',
        userPhone: u ? formatPhoneRu(u.phone) : '—',
        question: userMsg.content,
        answer: assistantMsg ? assistantMsg.content : '',
        pageUrl: userMsg.pageUrl || session?.pageUrl || '',
        createdAt: userMsg.createdAt
      });
    }
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========== ПУБЛИЧНЫЕ ЭНДПОИНТЫ ДЛЯ ГЛАВНОЙ СТРАНИЦЫ ==========
// ========== ПУБЛИЧНЫЕ ЭНДПОИНТЫ ДЛЯ ГЛАВНОЙ СТРАНИЦЫ ==========
app.get('/api/gp/current', async (_req, res) => {
  try {
    let settings = await GpSettings.findByPk(1);
    if (!settings) {
      settings = await GpSettings.create({ id: 1, name: 'Япония, Сузука', round: 16, startDate: null });
    }
    res.json(settings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/news', async (_req, res) => {
  try {
    const news = await News.findAll({ order: [['id', 'DESC']] });
    res.json(news);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========== СТАТИКА ==========
app.use('/uploads', express.static(UPLOAD_ROOT));
app.use(express.static(path.join(__dirname)));

app.get('/', (_req, res) => { res.sendFile(path.join(__dirname, 'glav.html')); });

async function listenOnAvailablePort(startPort) {
  let lastErr;
  for (let p = startPort; p < startPort + 20; p++) {
    const server = app.listen(p);
    try {
      await once(server, 'listening');
      if (p !== startPort) console.log(`Port ${startPort} busy, using ${p}`);
      console.log(`Server running on http://localhost:${p}`);
      return;
    } catch (err) {
      lastErr = err;
      try { server.close(); } catch { }
      if (err.code !== 'EADDRINUSE') throw err;
    }
  }
  throw lastErr || new Error('No available port');
}

async function start() {
  await sequelize.authenticate();
  await sequelize.sync();
  await ensureAdminUser();
  await seedSystemData();
  await listenOnAvailablePort(PORT);
}

start().catch((err) => { console.error('Failed to start:', err); process.exit(1); });
