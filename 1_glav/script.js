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

// ========== ТАЙМЕР (только часы, минуты, секунды) ==========
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');

// Дата: 29 июня 2026 года, 18:00
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