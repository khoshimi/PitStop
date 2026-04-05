// ========== КАРУСЕЛЬ ==========
const slides = document.querySelectorAll('.carousel-slide');
const prevBtn = document.getElementById('carouselPrev');
const nextBtn = document.getElementById('carouselNext');
const dotsContainer = document.getElementById('carouselDots');

let currentSlide = 0;
const totalSlides = slides.length;
let autoSlideInterval;

// Создание точек
function createDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === currentSlide) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
}

// Переход к слайду
function goToSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === index) slide.classList.add('active');
    });
    
    currentSlide = index;
    
    // Обновление точек
    document.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
    });
}

// Следующий слайд
function nextSlide() {
    let newIndex = currentSlide + 1;
    if (newIndex >= totalSlides) newIndex = 0;
    goToSlide(newIndex);
}

// Предыдущий слайд
function prevSlide() {
    let newIndex = currentSlide - 1;
    if (newIndex < 0) newIndex = totalSlides - 1;
    goToSlide(newIndex);
}

// Автоматическая прокрутка
function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 5000);
}

function stopAutoSlide() {
    clearInterval(autoSlideInterval);
}

// Инициализация
function initCarousel() {
    createDots();
    
    // Показываем первый слайд
    goToSlide(0);
    
    prevBtn.addEventListener('click', () => {
        prevSlide();
        stopAutoSlide();
        startAutoSlide();
    });
    
    nextBtn.addEventListener('click', () => {
        nextSlide();
        stopAutoSlide();
        startAutoSlide();
    });
    
    // Пауза при наведении
    const carousel = document.querySelector('.carousel-container');
    carousel.addEventListener('mouseenter', stopAutoSlide);
    carousel.addEventListener('mouseleave', startAutoSlide);
    
    startAutoSlide();
}

// ========== АНИМАЦИЯ ПРИ СКРОЛЛЕ ==========
function animateOnScroll() {
    const elements = document.querySelectorAll('.main-dishes-section, .charles-advice');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '50px' });
    
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    animateOnScroll();
});