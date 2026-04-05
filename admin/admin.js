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
    const data = await res.json().catch(function () {
      return {};
    });
    if (!res.ok) {
      throw new Error(data.error || 'Ошибка ' + res.status);
    }
    return data;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function loadUsers() {
    const tbody = document.querySelector('#users-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" class="muted">Загрузка…</td></tr>';
    try {
      const list = await api('/api/admin/users', { method: 'GET' });
      tbody.innerHTML = '';
      list.forEach(function (u) {
        const tr = document.createElement('tr');
        const created = u.createdAt ? new Date(u.createdAt).toLocaleString('ru-RU') : '—';
        tr.innerHTML =
          '<td>' +
          u.id +
          '</td><td>' +
          escapeHtml(u.name) +
          '</td><td>' +
          escapeHtml(u.phone) +
          '</td><td>' +
          escapeHtml(u.role) +
          '</td><td class="muted">' +
          escapeHtml(created) +
          '</td>';
        tbody.appendChild(tr);
      });
    } catch (e) {
      tbody.innerHTML = '<tr><td colspan="5" class="muted">' + escapeHtml(e.message) + '</td></tr>';
    }
  }

  async function loadReviews() {
    const box = document.getElementById('reviews-admin');
    if (!box) return;
    box.innerHTML = '<p class="muted">Загрузка…</p>';
    try {
      const list = await api('/api/admin/reviews', { method: 'GET' });
      box.innerHTML = '';
      list.forEach(function (r) {
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

        const inName = document.createElement('input');
        inName.type = 'text';
        inName.className = 'rev-name';
        inName.placeholder = 'Имя';
        inName.value = r.name || '';

        const inDate = document.createElement('input');
        inDate.type = 'text';
        inDate.className = 'rev-date';
        inDate.placeholder = 'Дата (как на сайте)';
        inDate.value = r.date || '';

        const ta = document.createElement('textarea');
        ta.className = 'rev-text';
        ta.placeholder = 'Текст';
        ta.value = r.text || '';

        const rowBtns = document.createElement('div');
        rowBtns.style.display = 'flex';
        rowBtns.style.gap = '0.5rem';

        const btnSave = document.createElement('button');
        btnSave.type = 'button';
        btnSave.className = 'btn btn-primary btn-small rev-save';
        btnSave.textContent = 'Сохранить';

        const btnDel = document.createElement('button');
        btnDel.type = 'button';
        btnDel.className = 'btn btn-ghost btn-small rev-delete';
        btnDel.textContent = 'Удалить';

        rowBtns.appendChild(btnSave);
        rowBtns.appendChild(btnDel);
        edit.appendChild(inName);
        edit.appendChild(inDate);
        edit.appendChild(ta);
        edit.appendChild(rowBtns);
        wrap.appendChild(edit);
        box.appendChild(wrap);

        btnSave.addEventListener('click', async function () {
          try {
            const name = inName.value.trim();
            const date = inDate.value.trim();
            const text = ta.value.trim();
            await api('/api/admin/reviews/' + r.id, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: name, text: text, date: date })
            });
            flash('Отзыв #' + r.id + ' сохранён', true);
          } catch (err) {
            flash(err.message, false);
          }
        });

        btnDel.addEventListener('click', async function () {
          if (!confirm('Удалить отзыв #' + r.id + '?')) return;
          try {
            await api('/api/admin/reviews/' + r.id, { method: 'DELETE' });
            flash('Отзыв удалён', true);
            wrap.remove();
          } catch (err) {
            flash(err.message, false);
          }
        });
      });
      if (list.length === 0) {
        box.innerHTML = '<p class="muted">Отзывов пока нет.</p>';
      }
    } catch (e) {
      box.innerHTML = '<p class="muted">' + escapeHtml(e.message) + '</p>';
    }
  }

  async function loadPromos() {
    const grid = document.getElementById('promo-admin');
    if (!grid) return;
    try {
      const { urls } = await api('/api/admin/promos', { method: 'GET' });
      grid.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const card = document.createElement('div');
        card.className = 'promo-card';

        const img = document.createElement('img');
        img.alt = 'Акция ' + (i + 1);
        img.src = (urls[i] || '') + (urls[i] && urls[i].indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now();

        const lbl = document.createElement('label');
        lbl.textContent = 'Новое изображение';

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        const btnUp = document.createElement('button');
        btnUp.type = 'button';
        btnUp.className = 'btn btn-primary btn-small promo-upload';
        btnUp.style.marginTop = '0.5rem';
        btnUp.style.width = '100%';
        btnUp.textContent = 'Загрузить слот ' + (i + 1);

        card.appendChild(img);
        card.appendChild(lbl);
        card.appendChild(input);
        card.appendChild(btnUp);
        grid.appendChild(card);

        btnUp.addEventListener('click', async function () {
          if (!input.files || !input.files[0]) {
            flash('Выберите файл', false);
            return;
          }
          const fd = new FormData();
          fd.append('image' + i, input.files[0]);
          try {
            const res = await fetch('/api/admin/promos', {
              method: 'PUT',
              headers: { Authorization: 'Bearer ' + token },
              body: fd
            });
            const data = await res.json().catch(function () {
              return {};
            });
            if (!res.ok) throw new Error(data.error || 'Ошибка загрузки');
            if (data.urls && data.urls[i]) {
              img.src = data.urls[i] + '?t=' + Date.now();
            }
            input.value = '';
            flash('Картинка ' + (i + 1) + ' обновлена', true);
          } catch (err) {
            flash(err.message, false);
          }
        });
      }
    } catch (e) {
      grid.innerHTML = '<p class="muted">' + escapeHtml(e.message) + '</p>';
    }
  }

  document.getElementById('admin-logout') &&
    document.getElementById('admin-logout').addEventListener('click', function () {
      localStorage.removeItem('pitstop_token');
      localStorage.removeItem('pitstop_current_user');
      redirectLogin();
    });

  loadUsers();
  loadReviews();
  loadPromos();
})();
