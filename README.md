# Pit-Stop Backend (Express + Sequelize + SQLite)

Единый backend для: меню, корзины, бронирования столиков, заказов, профиля, отзывов, акций и админки.

## Установка и запуск
```bash
npm install
npm run dev
```

Или:
```bash
npm start
```

Если порт из `.env` занят, сервер автоматически поднимется на ближайшем свободном (`3001`, `3002` и т.д.).
Открывай сайт по адресу, который выведен в терминале: `Server running on http://localhost:XXXX`.

## Важные сущности
- `User` (роль, баллы лояльности)
- `MenuCategory`, `MenuItem`
- `Cart`, `CartItem`
- `Order`, `OrderItem`
- `TableBooking`
- `PaymentMethod`, `PaymentAttempt` (mock-платежи)
- `LoyaltyTransaction`
- `Review`, `PromoBanner`

## Аутентификация
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

JWT токен хранится на фронте как `pitstop_token` и передается в `Authorization: Bearer <token>`.

## Меню / корзина / заказ
- `GET /api/menu/categories`
- `GET /api/menu/items`
- `GET /api/cart`
- `POST /api/cart/items`
- `POST /api/cart/items/custom` (добавление кастомной позиции с фронтовых карточек)
- `PUT /api/cart/items/:id`
- `DELETE /api/cart/items/:id`
- `POST /api/orders/checkout`
- `GET /api/orders/my`

### Checkout и карта
`POST /api/orders/checkout` принимает:
- `tableNumber`
- `useLoyaltyPoints`
- `cardNumber`
- `expiryMonth`
- `expiryYear`
- `cvc`

На сервере выполняется валидация карты:
- Luhn-проверка
- срок действия
- CVC
- определение типа карты

Полный PAN и CVC в БД не сохраняются. Сохраняются только `maskedPan`, `token`, `brand`, срок карты.

## Лояльность
- `GET /api/loyalty/balance`
- `GET /api/loyalty/transactions`

Логика:
- начисление: `5%` от суммы оплаченного заказа
- списание: не более `30%` суммы заказа

## Бронирование столиков
- `POST /api/bookings`
- `GET /api/bookings/my`
- `PATCH /api/bookings/:id/cancel`

## Профиль
- `GET /api/profile`

Возвращает:
- данные пользователя
- бронирования
- последние заказы
- сохраненные карты (masked)
- операции по баллам

## Отзывы и акции (публично)
- `GET /api/reviews`
- `POST /api/reviews` (только авторизованный пользователь)
- `GET /api/promos`

## Админ API
Требуется пользователь с ролью `admin`.

- `GET /api/admin/users`
- `GET /api/admin/orders`
- `GET /api/admin/bookings`
- `PATCH /api/admin/bookings/:id`
- `GET /api/admin/reviews`
- `PUT /api/admin/reviews/:id`
- `DELETE /api/admin/reviews/:id`
- `GET /api/admin/promos`
- `PUT /api/admin/promos` (multipart поля `image0`, `image1`, `image2`)

## Админ-панель
- Страница: `admin.html`
- Вход в админку через обычный `reg.html` (если у пользователя роль `admin`, редиректится в `admin.html`)

## Переменные `.env`
- `PORT`
- `DB_STORAGE`
- `JWT_SECRET`
- `ADMIN_PHONE`
- `ADMIN_NAME`
- `ADMIN_PASSWORD`

При старте сервер синхронизирует админ-пользователя из `.env` (роль, имя, пароль).
