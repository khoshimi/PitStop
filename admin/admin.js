(function () {
  const token = localStorage.getItem('pitstop_token');
  const userRaw = localStorage.getItem('pitstop_current_user');

  function redirectLogin() {
    window.location.href = '/reg.html';
  }

  let user;
  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch {
    user = null;
  }

  if (!token || !user || !user.isAdmin) {
    redirectLogin();
    return;
  }

  const authHeaders = {
    Authorization: 'Bearer ' + token,
    Accept: 'application/json'
  };

  const elFlash = document.getElementById('admin-flash');

  function flash(msg, ok) {
    if (!elFlash) return;
    elFlash.textContent = msg;
    elFlash.className = 'flash ' + (ok ? 'flash-ok' : 'flash-err');
    elFlash.classList.remove('hidden');
    setTimeout(function () {
      elFlash.classList.add('hidden');
    }, 4000);
  }

  async function api(path, opts) {
    const res = await fetch(path, {
      ...opts,
      headers: { ...authHeaders, ...((opts && opts.headers) || {}) }
    });
    const data = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(data.error || 'Ошибка ' + res.status);
    return data;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ========== ПЕРЕКЛЮЧЕНИЕ ТАБОВ ==========
  function initTabs() {
    const navLinks = document.querySelectorAll('.admin-nav-link');
    const tabs = document.querySelectorAll('.admin-tab');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = link.getAttribute('data-tab');
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        tabs.forEach(tab => tab.classList.remove('active'));
        document.getElementById(`tab-${tabId}`).classList.add('active');
        
        if (tabId === 'reviews') loadReviews();
        if (tabId === 'news') loadNews();
        if (tabId === 'orders') loadOrders();
        if (tabId === 'bookings') loadBookings();
        if (tabId === 'gp') loadGpSettings();
        if (tabId === 'users') loadUsers();
        if (tabId === 'chat') loadChat();
      });
    });
  }

  // ========== ПОЛЬЗОВАТЕЛИ ==========
  async function loadUsers() {
    const tbody = document.querySelector('#users-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="muted">Загрузка…</td></tr>';
    try {
      const list = await api('/api/admin/users', { method: 'GET' });
      tbody.innerHTML = '';
      list.forEach(u => {
        const created = u.createdAt ? new Date(u.createdAt).toLocaleString('ru-RU') : '—';
        tbody.innerHTML += `<tr>
          <td>${u.id}</td>
          <td>${escapeHtml(u.name)}</td>
          <td>${escapeHtml(u.phone)}</td>
          <td>${escapeHtml(u.role)}</td>
          <td>${u.loyaltyPoints || 0}</td>
          <td class="muted">${escapeHtml(created)}</td>
        </tr>`;
      });
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="6" class="muted">${escapeHtml(e.message)}</td></tr>`;
    }
  }

  // ========== ГРАН-ПРИ ==========
  async function loadGpSettings() {
    try {
      const data = await api('/api/admin/gp-settings', { method: 'GET' });
      document.getElementById('gp-name').value = data.name || '';
      document.getElementById('gp-round').value = data.round || '';
      
      if (data.startDate) {
        const date = new Date(data.startDate);
        const formatted = date.toISOString().slice(0, 16);
        document.getElementById('gp-start-date').value = formatted;
      }
      
      document.getElementById('current-gp-name').innerText = data.name || '—';
      document.getElementById('current-gp-round').innerText = data.round || '—';
      document.getElementById('current-gp-start').innerText = data.startDate ? new Date(data.startDate).toLocaleString('ru-RU') : '—';
      
      if (data.startDate) {
        const countdown = getCountdownText(new Date(data.startDate));
        document.getElementById('countdown-preview').innerHTML = `Таймер покажет: ${countdown}`;
      } else {
        document.getElementById('countdown-preview').innerHTML = 'Таймер не настроен';
      }
      
      const flagPreview = document.getElementById('gp-flag-preview');
      const bgPreview = document.getElementById('gp-bg-preview');
      
      if (data.flagUrl) {
        flagPreview.innerHTML = `<img src="${data.flagUrl}?t=${Date.now()}" style="max-width:100px; border-radius:8px;"><span class="muted" style="display:block;">Текущий флаг</span>`;
      } else {
        flagPreview.innerHTML = '<span class="muted">Флаг не загружен</span>';
      }
      
      if (data.backgroundUrl) {
        bgPreview.innerHTML = `<img src="${data.backgroundUrl}?t=${Date.now()}" style="max-width:200px; border-radius:8px;"><span class="muted" style="display:block;">Текущее фоновое изображение</span>`;
      } else {
        bgPreview.innerHTML = '<span class="muted">Фоновое изображение не загружено</span>';
      }
    } catch (e) {
      flash(e.message, false);
    }
  }

  function getCountdownText(targetDate) {
    const now = new Date();
    const diff = targetDate - now;
    if (diff <= 0) return 'ГОНКА УЖЕ ИДЁТ!';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (86400000)) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (days > 0) return `${days}д ${hours}ч ${minutes}м`;
    return `${hours}ч ${minutes}м`;
  }

  async function saveGpSettings() {
    const formData = new FormData();
    formData.append('name', document.getElementById('gp-name').value);
    formData.append('round', document.getElementById('gp-round').value);
    formData.append('startDate', document.getElementById('gp-start-date').value);
    
    const flagFile = document.getElementById('gp-flag-input').files[0];
    const bgFile = document.getElementById('gp-bg-input').files[0];
    if (flagFile) formData.append('flag', flagFile);
    if (bgFile) formData.append('background', bgFile);
    
    try {
      const res = await fetch('/api/admin/gp-settings', {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + token },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      flash('Настройки Гран-при сохранены', true);
      loadGpSettings();
      document.getElementById('gp-flag-input').value = '';
      document.getElementById('gp-bg-input').value = '';
    } catch (e) {
      flash(e.message, false);
    }
  }

  // ========== ЗАКАЗЫ ==========
  async function loadOrders() {
    const tbody = document.querySelector('#orders-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="muted">Загрузка…</td></tr>';
    try {
      const list = await api('/api/admin/orders', { method: 'GET' });
      tbody.innerHTML = '';
      for (const o of list) {
        const userLabel = o.User ? `${o.User.name} (${o.User.phone})` : '—';
        const items = (o.OrderItems || []).map(i => `${i.titleSnapshot} x${i.quantity}`).join(', ');
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${o.id}</td>
          <td>${escapeHtml(userLabel)}</td>
          <td>${escapeHtml(String(o.total))} ₽</td>
          <td>
            <select class="order-status-select" data-id="${o.id}">
              <option value="active" ${o.status === 'active' ? 'selected' : ''}>Активный</option>
              <option value="ready" ${o.status === 'ready' ? 'selected' : ''}>Готов</option>
              <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Выдан</option>
            </select>
          </td>
          <td class="muted">${escapeHtml(items || '—')}</td>
          <td><button class="btn btn-primary btn-small order-update" data-id="${o.id}">Обновить</button></td>
        `;
        tbody.appendChild(tr);
      }
      if (!list.length) tbody.innerHTML = '<tr><td colspan="6" class="muted">Заказов нет</td></tr>';
      
      document.querySelectorAll('.order-update').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const select = document.querySelector(`.order-status-select[data-id="${id}"]`);
          const newStatus = select.value;
          await updateOrderStatus(id, newStatus);
        });
      });
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="6" class="muted">${escapeHtml(e.message)}</td></tr>`;
    }
  }

  async function updateOrderStatus(orderId, status) {
    try {
      await api(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      flash(`Заказ #${orderId} обновлён`, true);
      loadOrders();
    } catch (e) {
      flash(e.message, false);
    }
  }

  // ========== БРОНИРОВАНИЯ ==========
  async function loadBookings() {
    const tbody = document.querySelector('#bookings-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="muted">Загрузка…</td></tr>';
    try {
      const list = await api('/api/admin/bookings', { method: 'GET' });
      tbody.innerHTML = '';
      list.forEach(b => {
        const userLabel = b.User ? `${b.User.name} (${b.User.phone})` : '—';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${b.id}</td>
          <td>${escapeHtml(userLabel)}</td>
          <td>${escapeHtml(String(b.tableNumber))}</td>
          <td>${escapeHtml(new Date(b.bookingAt).toLocaleString('ru-RU'))}</td>
          <td>${escapeHtml(b.status)}</td>
          <td>
            <button class="btn btn-primary btn-small booking-approve" data-id="${b.id}">Одобрить</button>
            <button class="btn btn-danger btn-small booking-reject" data-id="${b.id}">Отклонить</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
      if (!list.length) tbody.innerHTML = '<tr><td colspan="6" class="muted">Бронирований нет</td></tr>';
      
      tbody.querySelectorAll('.booking-approve').forEach(btn => {
        btn.addEventListener('click', async () => updateBookingStatus(btn.dataset.id, 'approved'));
      });
      tbody.querySelectorAll('.booking-reject').forEach(btn => {
        btn.addEventListener('click', async () => updateBookingStatus(btn.dataset.id, 'rejected'));
      });
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="6" class="muted">${escapeHtml(e.message)}</td></tr>`;
    }
  }

  async function updateBookingStatus(id, status) {
    try {
      await api(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      flash('Статус брони обновлён', true);
      loadBookings();
    } catch (e) {
      flash(e.message, false);
    }
  }

  // ========== ОТЗЫВЫ ==========
  async function loadReviews() {
    const box = document.getElementById('reviews-admin');
    if (!box) return;
    box.innerHTML = '<p class="muted">Загрузка…</p>';
    try {
      const list = await api('/api/admin/reviews', { method: 'GET' });
      box.innerHTML = '';
      list.forEach(r => {
        const wrap = createReviewElement(r);
        box.appendChild(wrap);
      });
      if (list.length === 0) box.innerHTML = '<p class="muted">Отзывов пока нет.</p>';
    } catch (e) {
      box.innerHTML = '<p class="muted">' + escapeHtml(e.message) + '</p>';
    }
  }

  function createReviewElement(r) {
    const wrap = document.createElement('div');
    wrap.className = 'admin-section';
    wrap.style.marginBottom = '1.25rem';
    wrap.style.paddingBottom = '1rem';
    wrap.style.borderBottom = '1px solid #2d323c';
    wrap.dataset.reviewId = String(r.id);

    const meta = document.createElement('p');
    meta.className = 'muted';
    meta.style.margin = '0 0 0.5rem';
    meta.textContent = '#' + r.id + ' · ' + (r.date || '');
    wrap.appendChild(meta);

    const edit = document.createElement('div');
    edit.className = 'review-edit';
    edit.innerHTML = `
      <input type="text" class="rev-name" placeholder="Имя" value="${escapeHtml(r.name || '')}">
      <input type="text" class="rev-date" placeholder="Дата" value="${escapeHtml(r.date || '')}">
      <textarea class="rev-text" placeholder="Текст отзыва">${escapeHtml(r.text || '')}</textarea>
      <div style="display:flex; gap:0.5rem;">
        <button class="btn btn-primary btn-small rev-save">Сохранить</button>
        <button class="btn btn-danger btn-small rev-delete">Удалить</button>
      </div>
    `;
    wrap.appendChild(edit);

    edit.querySelector('.rev-save').addEventListener('click', async () => {
      try {
        await api('/api/admin/reviews/' + r.id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: edit.querySelector('.rev-name').value.trim(),
            text: edit.querySelector('.rev-text').value.trim(),
            date: edit.querySelector('.rev-date').value.trim()
          })
        });
        flash('Отзыв #' + r.id + ' сохранён', true);
      } catch (err) { flash(err.message, false); }
    });

    edit.querySelector('.rev-delete').addEventListener('click', async () => {
      if (!confirm('Удалить отзыв #' + r.id + '?')) return;
      try {
        await api('/api/admin/reviews/' + r.id, { method: 'DELETE' });
        flash('Отзыв удалён', true);
        wrap.remove();
      } catch (err) { flash(err.message, false); }
    });
    return wrap;
  }

  async function addReview() {
    try {
      await api('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Новый отзыв', date: new Date().toLocaleDateString('ru-RU'), text: 'Текст отзыва' })
      });
      flash('Отзыв добавлен', true);
      loadReviews();
    } catch (err) { flash(err.message, false); }
  }

  // ========== НОВОСТИ ==========
  async function loadNews() {
    const box = document.getElementById('news-admin');
    if (!box) return;
    box.innerHTML = '<p class="muted">Загрузка новостей...</p>';
    try {
      const list = await api('/api/admin/news', { method: 'GET' });
      console.log('Загружено новостей:', list.length);
      box.innerHTML = '';
      
      if (list.length === 0) {
        box.innerHTML = '<p class="muted">Новостей пока нет. Нажмите «+ Добавить новость».</p>';
      }
      
      list.forEach(n => {
        const wrap = createNewsElement(n);
        box.appendChild(wrap);
      });
    } catch (e) {
      console.error('Ошибка загрузки новостей:', e);
      box.innerHTML = '<p class="muted">Ошибка загрузки: ' + escapeHtml(e.message) + '</p>';
    }
  }

  function createNewsElement(n) {
    const wrap = document.createElement('div');
    wrap.className = 'news-item';
    wrap.dataset.newsId = String(n.id);
    
    wrap.innerHTML = `
      <div class="news-form-row">
        <label>Дата</label>
        <input type="text" class="news-date" value="${escapeHtml(n.date || '')}" placeholder="24 ИЮНЯ 2026">
      </div>
      <div class="news-form-row">
        <label>Заголовок</label>
        <input type="text" class="news-title" value="${escapeHtml(n.title || '')}" placeholder="Заголовок новости">
      </div>
      <div class="news-form-row">
        <label>Текст новости</label>
        <textarea class="news-excerpt" placeholder="Краткое описание новости/акции">${escapeHtml(n.excerpt || '')}</textarea>
      </div>
      <div class="news-form-row">
        <label>Изображение</label>
        <input type="file" class="news-image-input" accept="image/*">
        <div class="news-image-preview-container">
          ${n.image ? `<img src="${n.image}?t=${Date.now()}" class="news-image-preview" alt="preview">` : ''}
        </div>
      </div>
      <div class="news-actions">
        <button class="btn btn-primary btn-small news-save">Сохранить</button>
        <button class="btn btn-danger btn-small news-delete">Удалить</button>
      </div>
    `;
    
    const dateInput = wrap.querySelector('.news-date');
    const titleInput = wrap.querySelector('.news-title');
    const excerptTextarea = wrap.querySelector('.news-excerpt');
    const imageInput = wrap.querySelector('.news-image-input');
    const previewContainer = wrap.querySelector('.news-image-preview-container');
    const saveBtn = wrap.querySelector('.news-save');
    const deleteBtn = wrap.querySelector('.news-delete');
    
    imageInput.addEventListener('change', function() {
      if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
          previewContainer.innerHTML = `<img src="${e.target.result}" class="news-image-preview" alt="preview">`;
        };
        reader.readAsDataURL(imageInput.files[0]);
      }
    });
    
    saveBtn.addEventListener('click', async function() {
      try {
        const formData = new FormData();
        formData.append('date', dateInput.value);
        formData.append('title', titleInput.value);
        formData.append('excerpt', excerptTextarea.value);
        if (imageInput.files[0]) formData.append('image', imageInput.files[0]);
        
        const res = await fetch('/api/admin/news/' + n.id, {
          method: 'PUT',
          headers: { Authorization: 'Bearer ' + token },
          body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        flash('Новость сохранена', true);
        if (data.image) {
          previewContainer.innerHTML = `<img src="${data.image}?t=${Date.now()}" class="news-image-preview" alt="preview">`;
        }
      } catch (err) {
        flash(err.message, false);
      }
    });
    
    deleteBtn.addEventListener('click', async function() {
      if (!confirm('Удалить новость "' + titleInput.value + '"?')) return;
      try {
        await api('/api/admin/news/' + n.id, { method: 'DELETE' });
        flash('Новость удалена', true);
        wrap.remove();
        if (document.querySelectorAll('.news-item').length === 0) {
          document.getElementById('news-admin').innerHTML = '<p class="muted">Новостей пока нет. Нажмите «+ Добавить новость».</p>';
        }
      } catch (err) {
        flash(err.message, false);
      }
    });
    
    return wrap;
  }

  async function addNews() {
    try {
      await api('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toLocaleDateString('ru-RU').split('.').reverse().join(' ') + 'г.',
          title: 'Новая новость',
          excerpt: 'Введите текст новости здесь...',
          image: ''
        })
      });
      flash('Новость добавлена', true);
      loadNews();
    } catch (err) {
      flash(err.message, false);
    }
  }

  // ========== ЧАТ-БОТ ==========
  async function loadChat() {
    const tbody = document.querySelector('#chat-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" class="muted">Загрузка…</td></tr>';
    try {
      const items = await api('/api/admin/chat');
      if (!items.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="muted">Пока нет вопросов</td></tr>';
        return;
      }
      tbody.innerHTML = items.map(function (row) {
        const dt = row.createdAt ? new Date(row.createdAt).toLocaleString('ru-RU') : '—';
        const userLabel = escapeHtml(row.userName) + (row.userPhone && row.userPhone !== '—' ? '<br><span class="muted">' + escapeHtml(row.userPhone) + '</span>' : '');
        return '<tr>' +
          '<td>' + escapeHtml(dt) + '</td>' +
          '<td>' + userLabel + '</td>' +
          '<td style="max-width:220px">' + escapeHtml(row.question) + '</td>' +
          '<td style="max-width:280px">' + escapeHtml(row.answer || '—') + '</td>' +
          '<td><span class="muted">' + escapeHtml(row.pageUrl || '—') + '</span></td>' +
          '</tr>';
      }).join('');
    } catch (err) {
      tbody.innerHTML = '<tr><td colspan="5" class="muted">' + escapeHtml(err.message) + '</td></tr>';
    }
  }

  document.getElementById('refresh-chat-btn')?.addEventListener('click', loadChat);

  // ========== ВЫХОД ==========
  document.getElementById('admin-logout')?.addEventListener('click', () => {
    localStorage.removeItem('pitstop_token');
    localStorage.removeItem('pitstop_current_user');
    redirectLogin();
  });

  document.getElementById('add-news-btn')?.addEventListener('click', addNews);
  document.getElementById('add-review-btn')?.addEventListener('click', addReview);
  document.getElementById('save-gp-btn')?.addEventListener('click', saveGpSettings);

  // Запуск
  initTabs();
  loadUsers();
  loadGpSettings();
  loadOrders();
  loadBookings();
  loadReviews();
  loadNews();
})();