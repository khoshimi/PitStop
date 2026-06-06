function getToken() {
    return localStorage.getItem('pitstop_token');
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('pitstop_current_user') || 'null');
    } catch {
        return null;
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        return new Date(dateStr).toLocaleString('ru-RU');
    } catch {
        return dateStr;
    }
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function api(path, options) {
    const res = await fetch(path, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Ошибка сервера');
    return data;
}

function bookingStatusText(status) {
    if (status === 'approved') return '✓ Одобрено';
    if (status === 'rejected') return '✗ Отклонено';
    if (status === 'cancelled') return 'Отменено';
    return '⏳ Ожидает рассмотрения';
}

async function renderProfileFromApi() {
    const layout = document.getElementById('profile-layout');
    const emptyBlock = document.getElementById('profile-empty');
    const logoutBtn = document.getElementById('logout-btn');
    const linesContainer = document.getElementById('profile-lines');
    const applicationsList = document.getElementById('applications-list');
    const avatarImg = document.getElementById('profile-avatar');
    const avatarInput = document.getElementById('avatar-input');

    if (!getToken()) {
        if (layout) layout.style.display = 'none';
        if (emptyBlock) emptyBlock.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        return;
    }

    try {
        const profile = await api('/api/profile', {
            headers: { Authorization: 'Bearer ' + getToken() }
        });
        localStorage.setItem('pitstop_current_user', JSON.stringify(profile.user));
        if (layout) layout.style.display = 'flex';
        if (emptyBlock) emptyBlock.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';

        if (linesContainer) {
            linesContainer.innerHTML = `
                <div class="profile-line-row">
                    <div class="profile-line-label">Имя</div>
                    <div class="profile-line-value">${escapeHtml(profile.user.name)}</div>
                    <div class="profile-line-underline"></div>
                </div>
                <div class="profile-line-row">
                    <div class="profile-line-label">Телефон</div>
                    <div class="profile-line-value">${escapeHtml(profile.user.phoneDisplay || profile.user.phone)}</div>
                    <div class="profile-line-underline"></div>
                </div>
                <div class="profile-line-row">
                    <div class="profile-line-label">Баллы лояльности</div>
                    <div class="profile-line-value">${escapeHtml(profile.user.loyaltyPoints)}</div>
                    <div class="profile-line-underline"></div>
                </div>
            `;
        }

        if (applicationsList) {
            applicationsList.innerHTML = '';
            if (!profile.bookings.length) {
                applicationsList.innerHTML = '<li class="muted">Нет забронированного столика.</li>';
            } else {
                profile.bookings.forEach((b) => {
                    const li = document.createElement('li');
                    li.className = 'list-item';
                    li.innerHTML = `
                        <div class="list-item-top">
                            <span class="bold">Столик #${escapeHtml(b.tableNumber)}</span>
                            <span class="muted">${escapeHtml(formatDate(b.bookingAt))}</span>
                        </div>
                        <div class="list-item-status status-${escapeHtml(b.status)}">${bookingStatusText(b.status)}</div>
                        ${b.comment ? `<p class="muted comment-text">${escapeHtml(b.comment)}</p>` : ''}
                    `;
                    applicationsList.appendChild(li);
                });
            }
            if (profile.orders?.length) {
                const divider = document.createElement('li');
                divider.className = 'muted';
                divider.style.marginTop = '12px';
                divider.textContent = 'Последние заказы:';
                applicationsList.appendChild(divider);
                profile.orders.slice(0, 3).forEach((o) => {
                    const li = document.createElement('li');
                    li.className = 'list-item';
                    li.innerHTML = `
                        <div class="list-item-top">
                            <span class="bold">Заказ #${escapeHtml(o.id)}</span>
                            <span class="muted">${escapeHtml(formatDate(o.createdAt))}</span>
                        </div>
                        <div class="list-item-status">Сумма: ${escapeHtml(o.total)} ₽</div>
                    `;
                    applicationsList.appendChild(li);
                });
            }
        }

        if (avatarImg) {
            const key = `pitstop_avatar_${profile.user.phone}`;
            const savedAvatar = localStorage.getItem(key);
            avatarImg.src = savedAvatar || '1_glav/logo.png';
            if (avatarInput) {
                avatarInput.onchange = function(e) {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = function(evt) {
                        localStorage.setItem(key, evt.target.result);
                        avatarImg.src = evt.target.result;
                    };
                    reader.readAsDataURL(file);
                };
            }
        }
    } catch (err) {
        console.error(err);
        localStorage.removeItem('pitstop_token');
        localStorage.removeItem('pitstop_current_user');
        if (layout) layout.style.display = 'none';
        if (emptyBlock) emptyBlock.style.display = 'block';
    }
}

function initLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (!logoutBtn) return;
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('pitstop_current_user');
        localStorage.removeItem('pitstop_remembered');
        localStorage.removeItem('pitstop_token');
        window.location.reload();
    });
}

function initApplicationForm() {
    const form = document.getElementById('application-form');
    if (!form) return;
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!getToken()) {
            alert('Чтобы оформить бронь, войдите в систему');
            window.location.href = 'reg.html';
            return;
        }
        const tableNumber = Number(document.getElementById('app-direction')?.value || 0) || 1;
        const dateValue = document.getElementById('app-date')?.value;
        const comment = document.getElementById('app-comment')?.value || '';
        if (!dateValue) {
            alert('Выберите дату и время');
            return;
        }
        try {
            await api('/api/bookings', {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + getToken(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tableNumber,
                    bookingAt: dateValue,
                    comment
                })
            });
            alert('Бронь создана');
            window.location.href = 'profil.html';
        } catch (err) {
            alert(err.message);
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initLogout();
    initApplicationForm();
    renderProfileFromApi();
});