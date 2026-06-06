// ========== ГОРИЗОНТАЛЬНЫЙ СКРОЛЛ С БОЛИДОМ ==========
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

// ========== НОВОЕ: ПРОКРУТКА КОЛЁСИКОМ МЫШИ (горизонтальная) ==========
if (scrollContainer) {
    scrollContainer.addEventListener('wheel', (e) => {
        // Игнорируем, если зажат Shift или Ctrl (обычно они меняют направление)
        if (e.shiftKey || e.ctrlKey) return;
        // Прокручиваем контейнер горизонтально на величину вертикального движения колеса
        scrollContainer.scrollLeft += e.deltaY;
        // Предотвращаем вертикальную прокрутку страницы, пока курсор над контейнером
        e.preventDefault();
    }, { passive: false });
}

// ========== ТАЙМЕР (только часы, минуты, секунды) ==========
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');

const targetDate = new Date('June 29, 2026 18:00:00').getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const timeLeft = targetDate - now;

    if (timeLeft <= 0) {
        if (hoursElement) hoursElement.textContent = '00';
        if (minutesElement) minutesElement.textContent = '00';
        if (secondsElement) secondsElement.textContent = '00';
        return;
    }

    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
    if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
    if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
}

updateCountdown();
const countdownInterval = setInterval(updateCountdown, 1000);

// ========== АНИМАЦИЯ ПРИ СКРОЛЛЕ ==========
const animatedElements = document.querySelectorAll('.scroll-animate, .scroll-left');

function checkScroll() {
    animatedElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight - 100) {
            element.classList.add('visible');
        }
    });
}

window.addEventListener('scroll', checkScroll);
window.addEventListener('resize', checkScroll);
checkScroll(); // Запускаем сразу

// ========== НОВОСТИ И АКЦИИ (ТОЛЬКО ВИЗУАЛ, БЕЗ ПЕРЕХОДОВ) ==========
// Данные для новостей — админ сможет редактировать
const newsData = [
    {
        id: 1,
        date: "24 ИЮНЯ 2026",
        title: "Скидки для маленьких бельгийцев",
        excerpt: "Дети (до 12 лет) могут применить скидку 20% на всё меню в день Гран-при Бельгии.",
        image: "1_glav/news1.jpg"
    },
    {
        id: 2,
        date: "18 ИЮНЯ 2026",
        title: "Ночные гонки: бар открыт до 3:00",
        excerpt: "В день Гран-при Канады мы работаем до самого утра. Специальное меню и коктейли «Формула-1».",
        image: "1_glav/news2.jpg"
    },
    {
        id: 3,
        date: "10 ИЮНЯ 2026",
        title: "Встречаем Гран-при Японии",
        excerpt: "Уникальные роллы «Судзука» и саке-сет в подарок при заказе от 2000₽. Бронируйте столики заранее!",
        image: "1_glav/news3.jpg"
    },
    {
        id: 4,
        date: "5 ИЮНЯ 2026",
        title: "Новый мерч в баре Pit-Stop",
        excerpt: "Фирменные кепки, кружки и худи с логотипом команды. Доставка по всему городу.",
        image: "1_glav/news4.jpg"
    }
];

// Функция для рендера новостей (без переходов)
function renderNews() {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;

    // Очищаем контейнер
    newsGrid.innerHTML = '';

    // Проходим по всем новостям и создаём карточки
    newsData.forEach(news => {
        const newsCard = document.createElement('div');
        newsCard.className = 'news-card';
        // НИКАКОГО ПЕРЕХОДА — просто визуальный элемент
        // Можно добавить курсор-руку для красоты, но никуда не ведёт
        newsCard.style.cursor = 'default';

        // Блок с изображением
        const imageDiv = document.createElement('div');
        imageDiv.className = 'news-image';
        
        const img = document.createElement('img');
        // Если картинка не загрузится — показываем заглушку
        img.onerror = function() {
            this.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = 'news-image-placeholder';
            placeholder.innerHTML = '🏁';
            imageDiv.appendChild(placeholder);
        };
        img.src = news.image;
        img.alt = news.title;
        imageDiv.appendChild(img);

        // Блок с контентом
        const contentDiv = document.createElement('div');
        contentDiv.className = 'news-content';

        const dateSpan = document.createElement('div');
        dateSpan.className = 'news-date';
        dateSpan.textContent = news.date;

        const titleH3 = document.createElement('h3');
        titleH3.className = 'news-title';
        titleH3.textContent = news.title;

        const excerptP = document.createElement('p');
        excerptP.className = 'news-excerpt';
        excerptP.textContent = news.excerpt;

        // Убираем ссылку "Читать далее" или оставляем просто как декоративный элемент
        const linkDiv = document.createElement('div');
        linkDiv.className = 'news-link';
        // Делаем его просто текстом, без функционала
        linkDiv.style.cursor = 'default';

        // Собираем контент
        contentDiv.appendChild(dateSpan);
        contentDiv.appendChild(titleH3);
        contentDiv.appendChild(excerptP);
        contentDiv.appendChild(linkDiv);

        // Собираем карточку
        newsCard.appendChild(imageDiv);
        newsCard.appendChild(contentDiv);

        newsGrid.appendChild(newsCard);
    });
}

// Запускаем рендер, когда DOM загрузится
document.addEventListener('DOMContentLoaded', () => {
    renderNews();
});
// ========== ЗАГРУЗКА ДАННЫХ ГРАН-ПРИ ДЛЯ ГЛАВНОЙ СТРАНИЦЫ ==========
async function loadCurrentGP() {
    try {
        const response = await fetch('/api/gp/current');
        const data = await response.json();
        
        console.log('Данные Гран-при:', data);
        
        // Обновляем название страны в тексте
        const countryNameSpan = document.getElementById('gp-country-name');
        if (countryNameSpan && data.name) {
            let country = data.name.split(',')[0].trim();
            // Склоняем название
            if (country.endsWith('я')) country = country.slice(0, -1) + 'и';
            else if (country.endsWith('а')) country = country.slice(0, -1) + 'ы';
            else if (country.endsWith('ия')) country = country.slice(0, -2) + 'ии';
            countryNameSpan.innerText = country;
        }
        
        // Обновляем изображение превью
        const previewImg = document.getElementById('gp-preview-image');
        if (previewImg && data.backgroundUrl) {
            previewImg.src = data.backgroundUrl + '?t=' + Date.now();
        }
        
        // Обновляем таймер
        if (data.startDate) {
            startGPTimer(new Date(data.startDate));
        }
    } catch (error) {
        console.error('Ошибка загрузки данных Гран-при:', error);
    }
}

function startGPTimer(targetDate) {
    const hoursElement = document.getElementById('gp-hours');
    const minutesElement = document.getElementById('gp-minutes');
    const secondsElement = document.getElementById('gp-seconds');
    
    function updateTimer() {
        const now = new Date().getTime();
        const timeLeft = targetDate.getTime() - now;
        
        if (timeLeft <= 0) {
            if (hoursElement) hoursElement.textContent = '00';
            if (minutesElement) minutesElement.textContent = '00';
            if (secondsElement) secondsElement.textContent = '00';
            return;
        }
        
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
        if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
        if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
    }
    
    updateTimer();
    setInterval(updateTimer, 1000);
}

// Запускаем загрузку при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadCurrentGP();
});

// ========== ЗАГРУЗКА НОВОСТЕЙ НА ГЛАВНУЮ СТРАНИЦУ ==========
async function loadNewsOnMain() {
    try {
        const response = await fetch('/api/news');
        const newsList = await response.json();
        
        console.log('Загружено новостей:', newsList.length);
        
        const newsContainer = document.getElementById('newsGrid');
        if (!newsContainer) return;
        
        if (newsList.length === 0) {
            newsContainer.innerHTML = '<p class="muted" style="text-align:center; color:#9aa0a6;">Новостей пока нет</p>';
            return;
        }
        
        newsContainer.innerHTML = '';
        
        newsList.forEach(news => {
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card';
            newsCard.style.cursor = 'default';
            
            // Блок с изображением
            const imageDiv = document.createElement('div');
            imageDiv.className = 'news-image';
            
            const img = document.createElement('img');
            img.onerror = function() {
                this.style.display = 'none';
                const placeholder = document.createElement('div');
                placeholder.className = 'news-image-placeholder';
                placeholder.innerHTML = '🏁';
                imageDiv.appendChild(placeholder);
            };
            img.src = news.image && news.image !== '' ? news.image : '1_glav/news-placeholder.png';
            img.alt = news.title;
            imageDiv.appendChild(img);
            
            // Блок с контентом
            const contentDiv = document.createElement('div');
            contentDiv.className = 'news-content';
            
            const dateSpan = document.createElement('div');
            dateSpan.className = 'news-date';
            dateSpan.textContent = news.date;
            
            const titleH3 = document.createElement('h3');
            titleH3.className = 'news-title';
            titleH3.textContent = news.title;
            
            const excerptP = document.createElement('p');
            excerptP.className = 'news-excerpt';
            excerptP.textContent = news.excerpt;
            
            const linkDiv = document.createElement('div');
            linkDiv.className = 'news-link';
            linkDiv.textContent = 'Подробнее';
            linkDiv.style.cursor = 'default';
            
            contentDiv.appendChild(dateSpan);
            contentDiv.appendChild(titleH3);
            contentDiv.appendChild(excerptP);
            contentDiv.appendChild(linkDiv);
            
            newsCard.appendChild(imageDiv);
            newsCard.appendChild(contentDiv);
            
            newsContainer.appendChild(newsCard);
        });
    } catch (error) {
        console.error('Ошибка загрузки новостей:', error);
        const newsContainer = document.getElementById('newsGrid');
        if (newsContainer) {
            newsContainer.innerHTML = '<p class="muted" style="text-align:center; color:#9aa0a6;">Ошибка загрузки новостей</p>';
        }
    }
}

// ========== ЗАГРУЗКА ДАННЫХ ГРАН-ПРИ ==========
async function loadCurrentGP() {
    try {
        const response = await fetch('/api/gp/current');
        const data = await response.json();
        
        console.log('Данные Гран-при:', data);
        
        // Обновляем название страны в тексте
        const countryNameSpan = document.getElementById('gp-country-name');
        if (countryNameSpan && data.name) {
            let country = data.name.split(',')[0].trim();
            // Склоняем название
            if (country.endsWith('я')) country = country.slice(0, -1) + 'и';
            else if (country.endsWith('а')) country = country.slice(0, -1) + 'ы';
            else if (country.endsWith('ия')) country = country.slice(0, -2) + 'ии';
            countryNameSpan.innerText = country;
        }
        
        // Обновляем изображение превью
        const previewImg = document.getElementById('gp-preview-image');
        if (previewImg && data.backgroundUrl && data.backgroundUrl !== '') {
            previewImg.src = data.backgroundUrl + '?t=' + Date.now();
        }
        
        // Обновляем таймер
        if (data.startDate) {
            startGPTimer(new Date(data.startDate));
        }
    } catch (error) {
        console.error('Ошибка загрузки данных Гран-при:', error);
    }
}

function startGPTimer(targetDate) {
    const hoursElement = document.getElementById('gp-hours');
    const minutesElement = document.getElementById('gp-minutes');
    const secondsElement = document.getElementById('gp-seconds');
    
    if (!hoursElement) return;
    
    function updateTimer() {
        const now = new Date().getTime();
        const timeLeft = targetDate.getTime() - now;
        
        if (timeLeft <= 0) {
            hoursElement.textContent = '00';
            if (minutesElement) minutesElement.textContent = '00';
            if (secondsElement) secondsElement.textContent = '00';
            return;
        }
        
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        hoursElement.textContent = hours.toString().padStart(2, '0');
        if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
        if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
    }
    
    updateTimer();
    setInterval(updateTimer, 1000);
}

// Запускаем загрузку при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadCurrentGP();
    loadNewsOnMain();
});