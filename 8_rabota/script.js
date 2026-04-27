const btn1 = document.getElementById('btn1');
const btn2 = document.getElementById('btn2');
const btn3 = document.getElementById('btn3');

const info1 = document.getElementById('info1');
const info2 = document.getElementById('info2');
const info3 = document.getElementById('info3');

btn1.addEventListener('click', () => {
  // Скрываем все
  info1.classList.add('hidden');
  info2.classList.add('hidden');
  info3.classList.add('hidden');
  // Показываем нужный
  info1.classList.remove('hidden');
});

btn2.addEventListener('click', () => {
  info1.classList.add('hidden');
  info2.classList.add('hidden');
  info3.classList.add('hidden');
  info2.classList.remove('hidden');
});

btn3.addEventListener('click', () => {
  info1.classList.add('hidden');
  info2.classList.add('hidden');
  info3.classList.add('hidden');
  info3.classList.remove('hidden');
});

// Валидация ФИО (только буквы, пробелы, дефисы, точки)
function validateFullname(name) {
    const regex = /^[a-zA-Zа-яА-ЯёЁ\s\-\.]+$/;
    return regex.test(name) && name.trim().length >= 2;
}

// Валидация возраста (не младше 18)
function validateAge(birthdate) {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age >= 18;
}

// Валидация телефона (принимает +7, 8 или 10-11 цифр)
function validatePhone(phone) {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 11;
}

// Валидация email
function validateEmail(email) {
    const re = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return re.test(email);
}

// Валидация опыта (число от 0 до 50)
function validateExperience(years) {
    const num = parseInt(years);
    return !isNaN(num) && num >= 0 && num <= 50;
}

// Показ ошибок
function showError(elementId, message) {
    const errorDiv = document.getElementById(elementId);
    errorDiv.textContent = message;
}

function clearError(elementId) {
    showError(elementId, '');
}

// Обработка загрузки фото
const photoInput = document.getElementById('photoInput');
const previewImg = document.getElementById('previewImg');
const placeholderIcon = document.getElementById('placeholderIcon');
const uploadBtn = document.getElementById('uploadPhotoBtn');
let uploadedPhoto = null;

uploadBtn.addEventListener('click', () => {
    photoInput.click();
});

photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        // Проверка типа и размера
        if (!file.type.startsWith('image/')) {
            showError('photoError', 'Можно загружать только изображения');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showError('photoError', 'Файл не должен превышать 5 МБ');
            return;
        }
        clearError('photoError');
        
        const reader = new FileReader();
        reader.onload = function(event) {
            previewImg.src = event.target.result;
            previewImg.style.display = 'block';
            placeholderIcon.style.display = 'none';
            uploadedPhoto = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Обработка отправки формы
document.getElementById('baristaForm').addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;
    
    // 1. ФИО
    const fullname = document.getElementById('fullname').value.trim();
    if (!validateFullname(fullname)) {
        showError('fullnameError', 'ФИО должно содержать только буквы, пробелы, дефисы или точки (минимум 2 символа)');
        isValid = false;
    } else {
        clearError('fullnameError');
    }
    
    // 2. Дата рождения
    const birthdate = document.getElementById('birthdate').value;
    if (!birthdate) {
        showError('birthdateError', 'Укажите дату рождения');
        isValid = false;
    } else if (!validateAge(birthdate)) {
        showError('birthdateError', 'Вам должно быть не менее 18 лет');
        isValid = false;
    } else {
        clearError('birthdateError');
    }
    
    // 3. Телефон
    const phone = document.getElementById('phone').value.trim();
    if (!validatePhone(phone)) {
        showError('phoneError', 'Введите корректный номер телефона (10-11 цифр)');
        isValid = false;
    } else {
        clearError('phoneError');
    }
    
    // 4. Email
    const email = document.getElementById('email').value.trim();
    if (!validateEmail(email)) {
        showError('emailError', 'Введите корректный email (например, name@domain.ru)');
        isValid = false;
    } else {
        clearError('emailError');
    }
    
    // 5. Опыт работы (лет)
    const experience = document.getElementById('experience').value;
    if (!validateExperience(experience)) {
        showError('experienceError', 'Опыт работы должен быть числом от 0 до 50 лет');
        isValid = false;
    } else {
        clearError('experienceError');
    }
    
    // 6. Почему хотите работать
    const reason = document.getElementById('reason').value.trim();
    if (!reason) {
        showError('reasonError', 'Пожалуйста, расскажите, почему вы хотите работать у нас');
        isValid = false;
    } else {
        clearError('reasonError');
    }
    
    // 7. Согласие
    const consent = document.getElementById('consent').checked;
    if (!consent) {
        alert('Необходимо согласие на обработку персональных данных');
        isValid = false;
    }
    
    // 8. Фото (необязательное, но если загружено, то прошло проверку)
    
    if (isValid) {
        // Здесь можно отправить данные на сервер
        console.log('Данные анкеты:', {
            fullname,
            birthdate,
            phone,
            email,
            experience: parseInt(experience),
            reason,
            consent,
            photo: uploadedPhoto ? 'Фото загружено' : 'Без фото'
        });
        
        const successMsg = document.getElementById('successMessage');
        successMsg.classList.remove('hidden');
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Опционально очистить форму
        // document.getElementById('baristaForm').reset();
        // сброс фото
        // previewImg.style.display = 'none';
        // placeholderIcon.style.display = 'flex';
        // uploadedPhoto = null;
        
        setTimeout(() => {
            successMsg.classList.add('hidden');
        }, 5000);
    }
});

// Маска для телефона
const phoneInput = document.getElementById('phone');
phoneInput.addEventListener('input', function(e) {
    let x = this.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
    if (!x) return;
    this.value = (x[2] ? '+' + x[1] + ' (' + x[2] : '') + 
                  (x[3] ? ') ' + x[3] : '') + 
                  (x[4] ? '-' + x[4] : '') + 
                  (x[5] ? '-' + x[5] : '');
});

// Живая валидация для удобства
document.getElementById('fullname').addEventListener('input', function() {
    if (validateFullname(this.value.trim())) clearError('fullnameError');
    else showError('fullnameError', 'Только буквы, пробелы, дефисы, точки');
});

document.getElementById('birthdate').addEventListener('change', function() {
    if (this.value && validateAge(this.value)) clearError('birthdateError');
    else if (this.value) showError('birthdateError', 'Должно быть 18+');
});

document.getElementById('phone').addEventListener('input', function() {
    if (validatePhone(this.value.trim())) clearError('phoneError');
});

document.getElementById('email').addEventListener('input', function() {
    if (validateEmail(this.value.trim())) clearError('emailError');
});

document.getElementById('experience').addEventListener('input', function() {
    if (validateExperience(this.value)) clearError('experienceError');
});

document.getElementById('reason').addEventListener('input', function() {
    if (this.value.trim()) clearError('reasonError');
});