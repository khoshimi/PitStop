let cart = { items: [], selectedTotal: 0 };
let loyaltyBalance = 0;
let itemToDeleteId = null;

const deleteModal = document.getElementById('deleteModal');

function token() {
    return localStorage.getItem('pitstop_token');
}

function authHeaders(extra) {
    return {
        Authorization: 'Bearer ' + token(),
        ...extra
    };
}

async function api(path, options) {
    const res = await fetch(path, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Ошибка сервера');
    return data;
}

function checkAuth() {
    if (!token()) {
        alert('Сначала войдите в аккаунт');
        window.location.href = 'reg.html';
        return false;
    }
    return true;
}

function declOfNum(n, titles) {
    return titles[(n % 10 === 1 && n % 100 !== 11) ? 0 : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? 1 : 2];
}

function updateTotals() {
    const totalSpan = document.getElementById('totalPrice');
    const useBonuses = document.getElementById('useBonuses')?.checked || false;
    const selectedTotal = Number(cart.selectedTotal || 0);
    const maxAllowed = Math.floor(selectedTotal * 0.3);
    const spend = useBonuses ? Math.min(maxAllowed, loyaltyBalance) : 0;
    totalSpan.innerText = `${Math.max(0, selectedTotal - spend)} ₽`;
}

function renderCart() {
    const container = document.getElementById('cartItemsList');
    const itemsCountSpan = document.getElementById('itemsCount');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');

    if (!cart.items.length) {
        container.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
        itemsCountSpan.innerText = '0 товаров';
        updateTotals();
        if (selectAllCheckbox) selectAllCheckbox.checked = false;
        return;
    }

    let selectedCount = 0;
    container.innerHTML = cart.items.map((item) => {
        if (item.selected) selectedCount++;
        return `
            <div class="cart-item" data-id="${item.id}">
                <input type="checkbox" class="cart-item-checkbox" ${item.selected ? 'checked' : ''} data-id="${item.id}">
                <img src="${item.imageUrl || 'https://via.placeholder.com/80'}" alt="${item.title}" class="cart-item-img" onerror="this.src='https://via.placeholder.com/80'">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.title}</div>
                    <div class="cart-item-price">${item.price} ₽</div>
                    <div class="cart-item-quantity">
                        <button class="qty-minus" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-plus" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="cart-item-delete" data-id="${item.id}">✕</button>
            </div>
        `;
    }).join('');

    itemsCountSpan.innerText = `${cart.items.length} ${declOfNum(cart.items.length, ['товар', 'товара', 'товаров'])}`;
    if (selectAllCheckbox) selectAllCheckbox.checked = (selectedCount === cart.items.length && cart.items.length > 0);

    document.querySelectorAll('.cart-item-checkbox').forEach((cb) => {
        cb.addEventListener('change', async () => {
            const id = Number(cb.dataset.id);
            try {
                cart = await api(`/api/cart/items/${id}`, {
                    method: 'PUT',
                    headers: authHeaders({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify({ selected: cb.checked })
                });
                renderCart();
            } catch (e) {
                alert(e.message);
            }
        });
    });

    document.querySelectorAll('.qty-minus').forEach((btn) => {
        btn.addEventListener('click', async () => changeQty(Number(btn.dataset.id), -1));
    });
    document.querySelectorAll('.qty-plus').forEach((btn) => {
        btn.addEventListener('click', async () => changeQty(Number(btn.dataset.id), 1));
    });
    document.querySelectorAll('.cart-item-delete').forEach((btn) => {
        btn.addEventListener('click', () => {
            itemToDeleteId = Number(btn.dataset.id);
            if (deleteModal) deleteModal.style.display = 'flex';
        });
    });
    updateTotals();
}

async function changeQty(itemId, delta) {
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) return;
    const next = Math.max(1, item.quantity + delta);
    try {
        cart = await api(`/api/cart/items/${itemId}`, {
            method: 'PUT',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ quantity: next })
        });
        renderCart();
    } catch (e) {
        alert(e.message);
    }
}

async function loadCart() {
    if (!checkAuth()) return;
    try {
        const [cartData, loyalty] = await Promise.all([
            api('/api/cart', { headers: authHeaders() }),
            api('/api/loyalty/balance', { headers: authHeaders() })
        ]);
        cart = cartData;
        loyaltyBalance = Number(loyalty.points || 0);
        const bonusInfo = document.getElementById('bonusInfo');
        if (bonusInfo) bonusInfo.textContent = `У вас ${loyaltyBalance} баллов`;
        renderCart();
    } catch (e) {
        alert(e.message);
    }
}

document.getElementById('confirmDelete')?.addEventListener('click', async () => {
    if (!itemToDeleteId) return;
    try {
        cart = await api(`/api/cart/items/${itemToDeleteId}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        itemToDeleteId = null;
        if (deleteModal) deleteModal.style.display = 'none';
        renderCart();
    } catch (e) {
        alert(e.message);
    }
});

document.getElementById('cancelDelete')?.addEventListener('click', () => {
    itemToDeleteId = null;
    if (deleteModal) deleteModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
        itemToDeleteId = null;
        deleteModal.style.display = 'none';
    }
});

document.getElementById('selectAllCheckbox')?.addEventListener('change', async (e) => {
    const checked = e.target.checked;
    try {
        for (const item of cart.items) {
            if (item.selected !== checked) {
                await api(`/api/cart/items/${item.id}`, {
                    method: 'PUT',
                    headers: authHeaders({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify({ selected: checked })
                });
            }
        }
        cart = await api('/api/cart', { headers: authHeaders() });
        renderCart();
    } catch (err) {
        alert(err.message);
    }
});

document.getElementById('useBonuses')?.addEventListener('change', updateTotals);

document.getElementById('cardNumber')?.addEventListener('input', (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 19);
    e.target.value = digits.replace(/(.{4})/g, '$1 ').trim();
});

document.getElementById('orderBtn')?.addEventListener('click', async () => {
    if (!checkAuth()) return;
    if (!document.getElementById('agreeCheckbox')?.checked) {
        alert('Подтвердите согласие с правилами пользования');
        return;
    }
    const tableNumber = Number(document.getElementById('tableNumber')?.value || 0);
    if (!tableNumber) {
        alert('Укажите номер столика');
        return;
    }

    const useBonus = document.getElementById('useBonuses')?.checked;
    const selectedTotal = Number(cart.selectedTotal || 0);
    const maxAllowed = Math.floor(selectedTotal * 0.3);
    const useLoyaltyPoints = useBonus ? Math.min(maxAllowed, loyaltyBalance) : 0;

    const payload = {
        tableNumber,
        useLoyaltyPoints,
        cardNumber: document.getElementById('cardNumber')?.value || '',
        expiryMonth: Number(document.getElementById('cardMonth')?.value || 0),
        expiryYear: Number(document.getElementById('cardYear')?.value || 0),
        cvc: document.getElementById('cardCvc')?.value || ''
    };
    try {
        const result = await api('/api/orders/checkout', {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(payload)
        });
        alert(`Заказ #${result.orderId} оформлен!\nК оплате: ${result.total} ₽\nНачислено баллов: ${result.loyaltyEarned}`);
        await loadCart();
        document.getElementById('cardCvc').value = '';
        document.getElementById('agreeCheckbox').checked = false;
    } catch (e) {
        alert(e.message);
    }
});

loadCart();