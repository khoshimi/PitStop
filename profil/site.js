// ========== РАБОТА С ПОЛЬЗОВАТЕЛЯМИ (localStorage) ==========

function formatPhoneRu(phone) {
    const d = String(phone || '').replace(/\D/g, '');
    if (d.length === 11 && d[0] === '7') {
        return '+7 (' + d.slice(1, 4) + ') ' + d.slice(4, 7) + '-' + d.slice(7, 9) + '-' + d.slice(9, 11);
    }
    return phone || '';
}

function getCurrentUser() {
    const userJson = localStorage.getItem('pitstop_current_user');
    if (!userJson) return null;
    try {
        return JSON.parse(userJson);
    } catch(e) {
        return null;
    }
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('pitstop_current_user', JSON.stringify(user));
    } else {
        localStorage.removeItem('pitstop_current_user');
    }
}

function getAllUsers() {
    const usersJson = localStorage.getItem('pitstop_users');
    if (!usersJson) return [];
    try {
        return JSON.parse(usersJson);
    } catch(e) {
        return [];
    }
}

function saveUser(user) {
    const users = getAllUsers();
    const existingIndex = users.findIndex(u => u.phone === user.phone);
    if (existingIndex >= 0) {
        users[existingIndex] = user;
    } else {
        users.push(user);
    }
    localStorage.setItem('pitstop_users', JSON.stringify(users));
}

function getUserApplications(phone) {
    const appsJson = localStorage.getItem(`pitstop_applications_${phone}`);
    if (!appsJson) return [];
    try {
        return JSON.parse(appsJson);
    } catch(e) {
        return [];
    }
}

function saveApplication(phone, application) {
    const apps = getUserApplications(phone);
    const newApp = {
        id: Date.now(),
        ...application,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    apps.push(newApp);
    localStorage.setItem(`pitstop_applications_${phone}`, JSON.stringify(apps));
    return newApp;
}

// ========== СТРАНИЦА ПРОФИЛЯ ==========

document.addEventListener('DOMContentLoaded', function() {
    const layout = document.getElementById('profile-layout');
    const emptyBlock = document.getElementById('profile-empty');
    const logoutBtn = document.getElementById('logout-btn');
    const linesContainer = document.getElementById('profile-lines');
    const avatarImg = document.getElementById('profile-avatar');
    const avatarInput = document.getElementById('avatar-input');
    const applicationsList = document.getElementById('applications-list');

    function renderProfile() {
        const currentUser = getCurrentUser();
        
        if (!currentUser) {
            if (layout) layout.style.display = 'none';
            if (emptyBlock) emptyBlock.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            return;
        }
        
        if (layout) layout.style.display = 'flex';
        if (emptyBlock) emptyBlock.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        
        // Заполняем данные пользователя
        if (linesContainer) {
            linesContainer.innerHTML = '';
            
            function addLine(label, value) {
                const row = document.createElement('div');
                row.className = 'profile-line-row';
                row.innerHTML = `
                    <div class="profile-line-label">${label}</div>
                    <div class="profile-line-value">${escapeHtml(value || '')}</div>
                    <div class="profile-line-underline"></div>
                `;
                linesContainer.appendChild(row);
            }
            
            addLine('Имя', currentUser.name);
            addLine('Телефон', formatPhoneRu(currentUser.phone));
        }
        
        // Загружаем аватар
        if (avatarImg) {
            const savedAvatar = localStorage.getItem(`pitstop_avatar_${currentUser.phone}`);
            if (savedAvatar) {
                avatarImg.src = savedAvatar;
            } else {
                avatarImg.src = '1_glav/logo.png';
            }
        }
        
        // Загружаем заявки пользователя
        if (applicationsList) {
            const applications = getUserApplications(currentUser.phone);
            applicationsList.innerHTML = '';
            
            if (applications.length === 0) {
                const li = document.createElement('li');
                li.className = 'muted';
                li.textContent = 'Нет забронированного столика.';
                applicationsList.appendChild(li);
            } else {
                applications.reverse().forEach(function(app) {
                    const li = document.createElement('li');
                    li.className = 'list-item';
                    const statusText = getStatusText(app.status);
                    li.innerHTML = `
                        <div class="list-item-top">
                            <span class="bold">${escapeHtml(app.direction)}</span>
                            <span class="muted">${formatDate(app.date || app.createdAt)}</span>
                        </div>
                        <div class="list-item-status status-${app.status}">${statusText}</div>
                        ${app.comment ? `<p class="muted comment-text">${escapeHtml(app.comment)}</p>` : ''}
                    `;
                    applicationsList.appendChild(li);
                });
            }
        }
    }
    
    function getStatusText(status) {
        switch(status) {
            case 'approved': return '✓ Одобрено';
            case 'rejected': return '✗ Отклонено';
            default: return '⏳ Ожидает рассмотрения';
        }
    }
    
    function formatDate(dateStr) {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch(e) {
            return dateStr;
        }
    }
    
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    
    // Выход из аккаунта
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            setCurrentUser(null);
            localStorage.removeItem('pitstop_remembered');
            localStorage.removeItem('pitstop_token');
            renderProfile();
        });
    }
    
    // Смена аватара
    if (avatarInput) {
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            
            const currentUser = getCurrentUser();
            if (!currentUser) {
                alert('Сначала войдите в аккаунт');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(evt) {
                const avatarData = evt.target.result;
                localStorage.setItem(`pitstop_avatar_${currentUser.phone}`, avatarData);
                if (avatarImg) avatarImg.src = avatarData;
                alert('Фото профиля обновлено!');
            };
            reader.readAsDataURL(file);
        });
    }
    
    // Инициализация
    renderProfile();
});

// ========== ОБРАБОТКА ЗАЯВОК НА СТРАНИЦАХ ТИПА ar.html ==========

function initApplicationForm() {
    const applicationForm = document.getElementById('application-form');
    if (!applicationForm) return;
    
    const params = new URLSearchParams(window.location.search);
    const fromDirection = params.get('direction');
    const directionInput = document.getElementById('app-direction');
    
    const directionMap = {
        'adult-vocal': 'Взрослый вокал',
        guitar: 'Гитара',
        podcast: 'Подкаст',
        drums: 'Барабаны',
        electronic: 'Электронная музыка',
        'kids-vocal': 'Детский вокал'
    };
    
    if (directionInput && fromDirection && directionMap[fromDirection]) {
        directionInput.value = directionMap[fromDirection];
    }
    
    applicationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert('Чтобы оформить заявку, сначала войдите в систему');
            window.location.href = 'reg.html';
            return;
        }
        
        const direction = directionInput ? directionInput.value.trim() : '';
        const dateValue = document.getElementById('app-date').value;
        const comment = document.getElementById('app-comment') ? document.getElementById('app-comment').value.trim() : '';
        
        if (!direction || !dateValue) {
            alert('Пожалуйста, заполните направление и дату.');
            return;
        }
        
        const application = {
            direction: direction,
            date: dateValue,
            comment: comment
        };
        
        saveApplication(currentUser.phone, application);
        alert('Заявка отправлена! Вы можете посмотреть её в профиле.');
        window.location.href = 'profil.html';
    });
}

// ========== ОБРАБОТКА ОТЗЫВОВ ==========

function initReviews() {
    const feedbackForm = document.getElementById('feedback-form');
    const feedbackList = document.getElementById('feedback-list');
    
    // Загрузка отзывов
    function loadReviews() {
        if (!feedbackList) return;
        
        const reviewsJson = localStorage.getItem('pitstop_reviews');
        let reviews = [];
        if (reviewsJson) {
            try {
                reviews = JSON.parse(reviewsJson);
            } catch(e) {}
        }
        
        feedbackList.innerHTML = '';
        reviews.forEach(function(rev) {
            const li = document.createElement('li');
            li.className = 'feedback-item';
            li.innerHTML = `
                <p class="feedback-author">${escapeHtml(rev.name)}</p>
                <p class="feedback-text">${escapeHtml(rev.text)}</p>
            `;
            feedbackList.appendChild(li);
        });
    }
    
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nameInput = document.getElementById('fb-name');
            const textInput = document.getElementById('fb-text');
            const name = (nameInput ? nameInput.value.trim() : 'Аноним') || 'Аноним';
            const text = textInput ? textInput.value.trim() : '';
            
            if (!text) {
                alert('Пожалуйста, напишите текст отзыва.');
                return;
            }
            
            const reviewsJson = localStorage.getItem('pitstop_reviews');
            let reviews = [];
            if (reviewsJson) {
                try {
                    reviews = JSON.parse(reviewsJson);
                } catch(e) {}
            }
            
            const newReview = {
                id: Date.now(),
                name: name,
                text: text,
                date: new Date().toISOString()
            };
            
            reviews.unshift(newReview);
            localStorage.setItem('pitstop_reviews', JSON.stringify(reviews));
            
            if (feedbackList) {
                const li = document.createElement('li');
                li.className = 'feedback-item';
                li.innerHTML = `
                    <p class="feedback-author">${escapeHtml(newReview.name)}</p>
                    <p class="feedback-text">${escapeHtml(newReview.text)}</p>
                `;
                feedbackList.insertBefore(li, feedbackList.firstChild);
            }
            
            if (feedbackForm) feedbackForm.reset();
            alert('Спасибо за ваш отзыв!');
        });
    }
    
    loadReviews();
}

// Запускаем инициализацию
document.addEventListener('DOMContentLoaded', function() {
    initApplicationForm();
    initReviews();
});