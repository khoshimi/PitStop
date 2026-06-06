(function () {
  if (document.getElementById('pitstop-chat-root')) return;

  const SESSION_KEY = 'pitstop_chat_session';

  function loadCss() {
    if (document.getElementById('pitstop-chat-css')) return;
    const link = document.createElement('link');
    link.id = 'pitstop-chat-css';
    link.rel = 'stylesheet';
    link.href = '/chat/chat-widget.css';
    document.head.appendChild(link);
  }

  function getSessionId() {
    return localStorage.getItem(SESSION_KEY) || '';
  }

  function setSessionId(id) {
    if (id) localStorage.setItem(SESSION_KEY, id);
  }

  function getAuthHeaders() {
    const token = localStorage.getItem('pitstop_token');
    return token ? { Authorization: 'Bearer ' + token } : {};
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatText(text) {
    return escapeHtml(text).replace(/\n/g, '<br>');
  }

  loadCss();

  const root = document.createElement('div');
  root.id = 'pitstop-chat-root';
  root.innerHTML = `
    <button type="button" id="pitstop-chat-toggle" aria-label="Открыть чат-помощник">💬</button>
    <div id="pitstop-chat-panel" aria-hidden="true">
      <div class="pitstop-chat-header">
        <div>
          <h3>Pit-Stop помощник</h3>
          <p>Навигация по сайту и бронирование</p>
        </div>
        <button type="button" class="pitstop-chat-close" aria-label="Закрыть">×</button>
      </div>
      <div id="pitstop-chat-messages"></div>
      <form id="pitstop-chat-form">
        <textarea id="pitstop-chat-input" rows="1" placeholder="Спросите про меню, бронь, расписание…" maxlength="2000"></textarea>
        <button type="submit" id="pitstop-chat-send" aria-label="Отправить">➤</button>
      </form>
    </div>
  `;
  document.body.appendChild(root);

  const toggle = document.getElementById('pitstop-chat-toggle');
  const panel = document.getElementById('pitstop-chat-panel');
  const closeBtn = panel.querySelector('.pitstop-chat-close');
  const messagesEl = document.getElementById('pitstop-chat-messages');
  const form = document.getElementById('pitstop-chat-form');
  const input = document.getElementById('pitstop-chat-input');
  const sendBtn = document.getElementById('pitstop-chat-send');

  let isOpen = false;
  let isSending = false;
  let greeted = false;

  function scrollBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addMessage(role, text) {
    const el = document.createElement('div');
    el.className = 'pitstop-chat-msg ' + role;
    el.innerHTML = formatText(text);
    messagesEl.appendChild(el);
    scrollBottom();
    return el;
  }

  function setOpen(open) {
    isOpen = open;
    panel.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open && !greeted) {
      greeted = true;
      addMessage('assistant', 'Привет! Я помощник Pit-Stop. Подскажу, где меню, как забронировать столик на гонку и что есть на сайте.');
    }
    if (open) input.focus();
  }

  toggle.addEventListener('click', function () {
    setOpen(!isOpen);
  });

  closeBtn.addEventListener('click', function () {
    setOpen(false);
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  async function loadHistory() {
    const sessionId = getSessionId();
    if (!sessionId) return;
    try {
      const res = await fetch('/api/chat/history?sessionId=' + encodeURIComponent(sessionId), {
        headers: { Accept: 'application/json', ...getAuthHeaders() }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.messages && data.messages.length) {
        greeted = true;
        messagesEl.innerHTML = '';
        data.messages.forEach(function (m) {
          addMessage(m.role === 'user' ? 'user' : 'assistant', m.content);
        });
      }
    } catch (_) { /* ignore */ }
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (isSending) return;
    const text = input.value.trim();
    if (!text) return;

    addMessage('user', text);
    input.value = '';
    isSending = true;
    sendBtn.disabled = true;

    const typing = document.createElement('div');
    typing.className = 'pitstop-chat-typing';
    typing.textContent = 'Печатает…';
    messagesEl.appendChild(typing);
    scrollBottom();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          message: text,
          sessionId: getSessionId() || undefined,
          pageUrl: window.location.pathname + window.location.search
        })
      });
      const data = await res.json().catch(function () { return {}; });
      typing.remove();
      if (!res.ok) {
        addMessage('assistant', data.error || 'Не удалось получить ответ. Попробуйте позже.');
        return;
      }
      if (data.sessionId) setSessionId(data.sessionId);
      addMessage('assistant', data.reply || 'Готово.');
    } catch (err) {
      typing.remove();
      addMessage('assistant', 'Ошибка сети. Проверьте подключение и попробуйте снова.');
    } finally {
      isSending = false;
      sendBtn.disabled = false;
      input.focus();
    }
  });

  loadHistory();
})();
