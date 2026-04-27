// ==================== РАБОТА С КОРЗИНОЙ В LOCALSTORAGE ====================
let cart = []; // массив товаров { id, name, price, image, quantity, option? }
let itemToDelete = null; // для модалки удаления

// Загрузка корзины из localStorage
function loadCart() {
    const saved = localStorage.getItem('pitstop_cart');
    if (saved) {
        cart = JSON.parse(saved);
    } else {
        cart = [];
    }
    renderCart();
}

// Сохранение корзины
function saveCart() {
    localStorage.setItem('pitstop_cart', JSON.stringify(cart));
    renderCart(); // обновляем отображение
}

// Добавление товара (вызывается из страниц меню)
window.addToCart = function(item) {
    // item = { id, name, price, image, quantity, option? }
    const existingIndex = cart.findIndex(i => i.id === item.id && i.option === (item.option || ''));
    if (existingIndex !== -1) {
        cart[existingIndex].quantity += item.quantity;
    } else {
        cart.push({ ...item });
    }
    saveCart();
    alert(`Товар "${item.name}" добавлен в корзину`);
};

// Удаление товара
function deleteItem(index) {
    cart.splice(index, 1);
    saveCart();
    closeDeleteModal();
}

// Изменение количества
function changeQuantity(index, delta) {
    const newQty = cart[index].quantity + delta;
    if (newQty < 1) return;
    cart[index].quantity = newQty;
    saveCart();
}

// Переключение выбора товара
function toggleSelectItem(index, checked) {
    cart[index].selected = checked;
    saveCart();
}

// Выбрать/снять все
function selectAll(checked) {
    cart.forEach(item => item.selected = checked);
    saveCart();
}

// Подсчёт итоговой суммы (только выбранных)
function calculateTotal() {
    let total = 0;
    cart.forEach(item => {
        if (item.selected) {
            total += item.price * item.quantity;
        }
    });
    return total;
}

// ==================== ОТРИСОВКА КОРЗИНЫ ====================
function renderCart() {
    const container = document.getElementById('cartItemsList');
    const itemsCountSpan = document.getElementById('itemsCount');
    const totalSpan = document.getElementById('totalPrice');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');

    if (!cart.length) {
        container.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
        itemsCountSpan.innerText = '0 товаров';
        totalSpan.innerText = '0 ₽';
        if (selectAllCheckbox) selectAllCheckbox.checked = false;
        return;
    }

    let html = '';
    let selectedCount = 0;
    cart.forEach((item, idx) => {
        const isSelected = item.selected === true;
        if (isSelected) selectedCount++;
        html += `
            <div class="cart-item" data-index="${idx}">
                <input type="checkbox" class="cart-item-checkbox" ${isSelected ? 'checked' : ''} data-index="${idx}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://via.placeholder.com/80'">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}${item.option ? ` (${item.option})` : ''}</div>
                    <div class="cart-item-price">${item.price} ₽</div>
                    <div class="cart-item-quantity">
                        <button class="qty-minus" data-index="${idx}">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-plus" data-index="${idx}">+</button>
                    </div>
                </div>
                <button class="cart-item-delete" data-index="${idx}">✕</button>
            </div>
        `;
    });
    container.innerHTML = html;
    itemsCountSpan.innerText = `${cart.length} ${declOfNum(cart.length, ['товар', 'товара', 'товаров'])}`;
    
    // Обновляем "Все"
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = (selectedCount === cart.length && cart.length > 0);
    }
    
    // Пересчёт итога
    let total = calculateTotal();
    // Учитываем списание баллов
    const useBonuses = document.getElementById('useBonuses')?.checked || false;
    const bonusAmount = useBonuses ? Math.min(total, 325) : 0; // максимум 325 баллов (1 балл = 1 рубль)
    if (useBonuses) total = total - bonusAmount;
    totalSpan.innerText = `${total} ₽`;
    
    // Навешиваем обработчики после отрисовки
    document.querySelectorAll('.cart-item-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const idx = parseInt(e.target.dataset.index);
            toggleSelectItem(idx, e.target.checked);
        });
    });
    document.querySelectorAll('.qty-minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.index);
            changeQuantity(idx, -1);
        });
    });
    document.querySelectorAll('.qty-plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.index);
            changeQuantity(idx, 1);
        });
    });
    document.querySelectorAll('.cart-item-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.index);
            itemToDelete = idx;
            openDeleteModal();
        });
    });
}

// Склонение
function declOfNum(n, titles) {
    return titles[(n % 10 === 1 && n % 100 !== 11) ? 0 : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? 1 : 2];
}

// ==================== МОДАЛЬНОЕ ОКНО УДАЛЕНИЯ ====================
const deleteModal = document.getElementById('deleteModal');
const confirmDeleteBtn = document.getElementById('confirmDelete');
const cancelDeleteBtn = document.getElementById('cancelDelete');

function openDeleteModal() {
    deleteModal.style.display = 'flex';
}
function closeDeleteModal() {
    deleteModal.style.display = 'none';
    itemToDelete = null;
}
confirmDeleteBtn?.addEventListener('click', () => {
    if (itemToDelete !== null) {
        deleteItem(itemToDelete);
    }
    closeDeleteModal();
});
cancelDeleteBtn?.addEventListener('click', closeDeleteModal);
window.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDeleteModal();
});

// ==================== ОФОРМЛЕНИЕ ЗАКАЗА ====================
document.getElementById('orderBtn')?.addEventListener('click', () => {
    // Проверка авторизации
    const isLoggedIn = localStorage.getItem('pitstop_user_logged') === 'true';
    if (!isLoggedIn) {
        alert('Вы не авторизованы. Пожалуйста, войдите в профиль.');
        window.location.href = 'profil.html';
        return;
    }
    
    const agree = document.getElementById('agreeCheckbox').checked;
    if (!agree) {
        alert('Подтвердите согласие с правилами пользования');
        return;
    }
    
    const tableNumber = document.getElementById('tableNumber').value;
    if (!tableNumber) {
        alert('Укажите номер столика');
        return;
    }
    
    const selectedItems = cart.filter(item => item.selected);
    if (selectedItems.length === 0) {
        alert('Выберите хотя бы один товар для заказа');
        return;
    }
    
    // Итоговая сумма с учётом баллов
    let total = calculateTotal();
    const useBonuses = document.getElementById('useBonuses').checked;
    let bonusDiscount = 0;
    if (useBonuses) {
        bonusDiscount = Math.min(total, 325);
        total -= bonusDiscount;
    }
    
    // Здесь можно отправить заказ на сервер, пока просто alert
    alert(`Заказ оформлен!\nСтолик №${tableNumber}\nСумма к оплате: ${total} ₽\nСписано баллов: ${bonusDiscount}`);
    
    // Очищаем корзину от выбранных товаров (или всю корзину? Лучше только выбранные)
    cart = cart.filter(item => !item.selected);
    saveCart();
    
    // Сброс чекбокса баллов
    document.getElementById('useBonuses').checked = false;
    document.getElementById('agreeCheckbox').checked = false;
    document.getElementById('tableNumber').value = '';
});

// Обновление итога при изменении чекбокса "Списать баллы"
document.getElementById('useBonuses')?.addEventListener('change', () => {
    renderCart();
});

// Обработчик "Выбрать всё"
document.getElementById('selectAllCheckbox')?.addEventListener('change', (e) => {
    selectAll(e.target.checked);
});

// Инициализация
loadCart();

// ==================== ИМИТАЦИЯ АВТОРИЗАЦИИ (для теста) ====================
// Если нет ключа авторизации, создадим тестовый (чтобы не блокировать заказ)
if (!localStorage.getItem('pitstop_user_logged')) {
    // Для удобства тестирования: по умолчанию пользователь не залогинен.
    // На странице профиля нужно устанавливать localStorage.setItem('pitstop_user_logged', 'true')
    // Пока оставим false, чтобы проверить предупреждение.
    localStorage.setItem('pitstop_user_logged', 'false');
}