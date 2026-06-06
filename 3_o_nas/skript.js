// ========== ГОРИЗОНТАЛЬНЫЙ СКРОЛЛ С БОЛИДОМ (ДЛЯ СТРАНИЦЫ О НАС) ==========
const scrollContainer = document.getElementById('horScroll');
const scrollThumb = document.getElementById('scrollThumb');
const scrollTrack = document.querySelector('.scroll-track-bg');

function updateThumbPosition() {
    if (!scrollContainer || !scrollTrack || !scrollThumb) return;
    
    const scrollWidth = scrollContainer.scrollWidth;
    const clientWidth = scrollContainer.clientWidth;
    const scrollLeft = scrollContainer.scrollLeft;
    const maxScroll = scrollWidth - clientWidth;
    const scrollPercent = maxScroll > 0 ? scrollLeft / maxScroll : 0;
    
    const trackWidth = scrollTrack.clientWidth;
    const thumbWidth = scrollThumb.clientWidth;
    const maxThumbLeft = trackWidth - thumbWidth;
    
    scrollThumb.style.left = (scrollPercent * maxThumbLeft) + 'px';
}

let isDragging = false;

if (scrollThumb) {
    scrollThumb.addEventListener('mousedown', (e) => {
        isDragging = true;
        e.preventDefault();
    });
}

document.addEventListener('mousemove', (e) => {
    if (!isDragging || !scrollTrack || !scrollThumb || !scrollContainer) return;
    
    const trackRect = scrollTrack.getBoundingClientRect();
    const thumbRect = scrollThumb.getBoundingClientRect();
    let newLeft = e.clientX - trackRect.left - (thumbRect.width / 2);
    
    const maxLeft = trackRect.width - thumbRect.width;
    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    
    const scrollPercent = newLeft / maxLeft;
    const scrollWidth = scrollContainer.scrollWidth;
    const clientWidth = scrollContainer.clientWidth;
    const maxScroll = scrollWidth - clientWidth;
    
    scrollContainer.scrollLeft = scrollPercent * maxScroll;
    scrollThumb.style.left = newLeft + 'px';
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

if (scrollContainer) {
    scrollContainer.addEventListener('scroll', updateThumbPosition);
}
window.addEventListener('resize', updateThumbPosition);
setTimeout(updateThumbPosition, 100);

// ========== ПРОКРУТКА КОЛЁСИКОМ МЫШИ (ГОРИЗОНТАЛЬНАЯ) ==========
if (scrollContainer) {
    scrollContainer.addEventListener('wheel', (e) => {
        if (e.shiftKey || e.ctrlKey) return;
        scrollContainer.scrollLeft += e.deltaY;
        e.preventDefault();
    }, { passive: false });
}

// ========== СЛАЙДЕР ОТЗЫВОВ (существующий код) ==========
let reviews = [];
let currentIndex = 0;
let slidesPerView = 1;

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderSlider() {
    const track = document.getElementById('sliderTrack');
    const dotsContainer = document.getElementById('sliderDots');
    
    if (!track) return;
    
    track.innerHTML = '';
    reviews.forEach(review => {
        const card = document.createElement('div');
        card.className = 'slider-card';
        card.innerHTML = `
            <div class="review-header">
                <span class="review-name">${escapeHtml(review.name)}</span>
                <span class="review-date">${escapeHtml(review.date)}</span>
            </div>
            <p class="review-text">${escapeHtml(review.text)}</p>
        `;
        track.appendChild(card);
    });
    
    updateCardWidth();
    
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < reviews.length; i++) {
            const dot = document.createElement('div');
            dot.className = `dot ${i === currentIndex ? 'active' : ''}`;
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }
    
    updateSliderPosition();
}

function updateCardWidth() {
    const wrapper = document.querySelector('.slider-wrapper');
    const track = document.getElementById('sliderTrack');
    const cards = document.querySelectorAll('.slider-card');
    
    if (wrapper && track && cards.length > 0) {
        const wrapperWidth = wrapper.clientWidth;
        track.style.width = `${wrapperWidth * cards.length}px`;
        cards.forEach(card => {
            card.style.width = `${wrapperWidth}px`;
        });
    }
}

function updateSliderPosition() {
    const track = document.getElementById('sliderTrack');
    const wrapper = document.querySelector('.slider-wrapper');
    
    if (track && wrapper) {
        const offset = -currentIndex * wrapper.clientWidth;
        track.style.transform = `translateX(${offset}px)`;
    }
    
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
    });
}

function goToSlide(index) {
    if (index < 0) index = 0;
    if (index >= reviews.length) index = reviews.length - 1;
    currentIndex = index;
    updateSliderPosition();
}

function nextSlide() {
    if (currentIndex < reviews.length - 1) {
        currentIndex++;
        updateSliderPosition();
    }
}

function prevSlide() {
    if (currentIndex > 0) {
        currentIndex--;
        updateSliderPosition();
    }
}

async function addReviewViaApi(name, message) {
    if (!name.trim() || !message.trim()) {
        return false;
    }
    const token = localStorage.getItem('pitstop_token');
    if (!token) {
        alert('Чтобы оставить отзыв, войдите в аккаунт');
        window.location.href = 'reg.html';
        return false;
    }
    const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({ name: name.trim(), text: message.trim() })
    });
    if (!res.ok) {
        const err = await res.json().catch(function () { return {}; });
        alert(err.error || 'Не удалось отправить отзыв');
        return false;
    }
    const data = await res.json();
    reviews.push({ name: data.name, date: data.date, text: data.text });
    renderSlider();
    currentIndex = reviews.length - 1;
    updateSliderPosition();
    return true;
}

window.addEventListener('resize', () => {
    updateCardWidth();
    updateSliderPosition();
});

document.addEventListener('DOMContentLoaded', async function() {
    try {
        const res = await fetch('/api/reviews');
        if (res.ok) {
            const list = await res.json();
            reviews = list.map(function (item) {
                return { name: item.name, date: item.date, text: item.text };
            });
        }
    } catch (e) {
        console.warn('Отзывы не загружены с сервера', e);
    }

    renderSlider();

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    const form = document.getElementById('reviewForm');
    const successMsg = document.getElementById('formSuccess');

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const nameInput = document.getElementById('reviewName');
            const messageInput = document.getElementById('reviewMessage');

            const ok = await addReviewViaApi(nameInput.value, messageInput.value);
            if (ok) {
                nameInput.value = '';
                messageInput.value = '';

                successMsg.style.display = 'block';
                setTimeout(function() {
                    successMsg.style.display = 'none';
                }, 3000);
            }
        });
    }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const phone = normalizePhone(req.body?.phone || '');
    const password = String(req.body?.password || '');

    // Расширенная валидация входных данных
    if (name.length < 2) {
      return res.status(400).json({ error: 'Имя должно быть не короче 2 символов' });
    }
    if (name.length > 100) {
      return res.status(400).json({ error: 'Имя не должно превышать 100 символов' });
    }
    if (phone.length !== 11 || phone[0] !== '7') {
      return res.status(400).json({ error: 'Некорректный номер телефона' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль не короче 6 символов' });
    }
    if (password.length > 128) {
      return res.status(400).json({ error: 'Пароль не должен превышать 128 символов' });
    }

    const existing = await User.findOne({ where: { phone } });
    if (existing) {
      return res.status(409).json({ error: 'Пользователь с таким номером уже зарегистрирован' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({
      name,
      phone,
      passwordHash,
      role: 'user'
    });
    await getOrCreateCart(user.id);
    res.status(201).json({ user: userPublic(user), token: signToken(user) });
  } catch (e) {
    console.error('Registration error:', e);
    res.status(500).json({ error: 'Внутренняя ошибка сервера. Попробуйте позже.' });
  }
});
