// ==================== ДАННЫЕ О НАПИТКАХ ====================
const products = {
    // ----- ЛИМОНАДЫ -----
    limo_eau: {
        name: "Лимонад Eau Rouge",
        subtitle: "(Освежающий, дерзкий — как подъём к знаменитому повороту)",
        description: "Малиновая кислинка, пряный базилик и шипучий спрайт. Лёд, лайм и лёгкая сладость. Этот лимонад бьёт по рецепторам как резкий подъём Eau Rouge — не ожидаешь, но втягиваешься с первого глотка. Пьётся за секунду, но запоминается надолго.",
        ingredients: ["Спрайт 200мл", "Малина 40г", "Базилик 3-4листа", "Лёд"],
        nutrition: { kcal: "150", protein: "0,5", fat: "0", carbs: "38" },
        price: "280 ₽",
        detailImage: "napitki/cart/lim_er.png"
    },
    limo_monza: {
        name: "Лимонад Монца",
        subtitle: "(Скоростной, бодрящий — как прямая на легендарной итальянской трассе)",
        description: "Скоростной, бодрящий — как прямая на легендарной итальянской трассе",
        ingredients: ["Спрайт 200мл", "Апельсин 50г", "Имбирь 10г", "Мята 3-4листа", "Лёд"],
        nutrition: { kcal: "160", protein: "0,5", fat: "0", carbs: "40" },
        price: "290 ₽",
        detailImage: "napitki/cart/lim_monca.png"
    },
    limo_monaco: {
        name: "Лимонад Монако",
        subtitle: "(Шикарный, изящный — как яхты и шампанское на Гран-при в Монте-Карло)",
        description: "Нежный аромат розы, освежающий лайм и сладкая клубника. Этот лимонад пьют не спеша — как коктейль на палубе яхты. Цвет — бледно-розовый, вкус — утончённый, с кислинкой лайма и ягодной нотой. Идеальный выбор для тех, кто хочет не просто утолить жажду, а получить эстетическое удовольствие. Достоин подиума.",
        ingredients: ["Спрайт 200мл", "Розовый сироп 15мл", "Лайм 20г", "Клубника 40г", "Лёд"],
        nutrition: { kcal: "190", protein: "0,5", fat: "0", carbs: "48" },
        price: "320 ₽",
        detailImage: "napitki/cart/lim_monaco.png"
    },
    limo_silverstone: {
        name: "Лимонад Сильверстоун",
        subtitle: "(Британская сдержанность — свежий, хрустящий, без лишних эмоций)",
        description: "Огуречная прохлада, лаймовая кислинка и пряный базилик. Всё чётко, без пафоса, но с характером. Как самая быстрая трасса Великобритании — никакой воды, только сухой остаток. Пьётся легко, оставляет ощущение свежести и лёгкой гордости за британский стиль..",
        ingredients: ["Спрайт 200мл", "Огурец 40г", "Лайм 20г", "Базилик 3-4листа", "Лёд"],
        nutrition: { kcal: "140", protein: "0,5", fat: "0", carbs: "36" },
        price: "300 ₽",
        detailImage: "napitki/cart/lim_sil.png"
    },

    // ----- МОЛОЧНЫЕ КОКТЕЙЛИ -----
    shake_schumacher: {
        name: "Коктейль Шумахер",
        subtitle: "(Мощный, рекордный — как семь чемпионских титулов в одном стакане)",
        description: "Молоко, мороженое, банан и карамель — всего четыре ингредиента, но какой результат! Густая, шелковистая текстура, природная сладость банана и карамельный финиш. Этот коктейль не пьют — им заряжаются. Как Михаэль Шумахер на пике формы: никакой воды, только чистая мощность и рекордный вкус.",
        ingredients: ["Молоко 150мл", "Мороженое пломбир 80г", "Банан 100г", "Карамельный соус 20г"],
        nutrition: { kcal: "420", protein: "10", fat: "16", carbs: "64" },
        price: "320 ₽",
        detailImage: "napitki/cart/kok_schum.png"
    },
    shake_hamilton: {
        name: "Коктейль Хэмилтон",
        subtitle: "(Элегантный, стильный — как победный круг семикратного чемпиона)",
        description: "Молочная нежность, клубничная свежесть и белый шоколад. Никакой тяжести — только гладкость, изящество и долгое послевкусие. Как Льюис Хэмилтон за рулём: безупречный стиль, скорость и харизма в каждой детали. Коктейль, который пьют не спеша, наслаждаясь каждым глотком.",
        ingredients: ["Молоко 150мл", "Мороженое пломбир 80г", "Клубника 60г", "Белый шоколад 20г"],
        nutrition: { kcal: "440", protein: "10", fat: "20", carbs: "56" },
        price: "340 ₽",
        detailImage: "napitki/cart/kok_ham.png"
    },
    shake_kids: {
        name: "Коктейль детский",
        subtitle: "(Академия пилотов — первый шаг к большой победе)",
        description: "Молоко, мороженое, банан и шоколадный топпинг. Всё, что любят маленькие гонщики. Коктейль не слишком густой, не приторный, но очень вкусный. Пьётся легко, оставляет шоколадную улыбку. Идеальный финиш после детского набора «Юный пилот». Будущие чемпионы растут с правильными углеводами.",
        ingredients: ["Молоко 150мл", "Мороженое пломбир 80г", "Банан 100г", "Шоколадный топпинг 15г"],
        nutrition: { kcal: "380", protein: "9", fat: "14", carbs: "56" },
        price: "250 ₽",
        detailImage: "napitki/cart/kok_kids.png"
    },

    // ----- КОФЕ / ЧАЙ (общая карточка) -----
    hot_tea_coffee: {
        name: "Ассорти кофе и чая",
        subtitle: "(Тонизаторы)",
        description: "Выберите ваш идеальный напиток для концентрации и бодрости.",
        ingredients: ["кофе", "чай", "молоко (опционально)"],
        nutrition: { kcal: "0–120", protein: "0–4", fat: "0–5", carbs: "0–12" },
        price: "от 150 ₽",
        detailImage: "napitki/cart/tea_coffee.png"
    },

    // ----- СОКИ / МОРСЫ (общая карточка) -----
    juice_mors: {
        name: "Соки и морсы",
        subtitle: "(Витаминная атака)",
        description: "Свежевыжатые соки и домашние морсы. Заряд витаминов перед гонкой.",
        ingredients: ["фрукты", "ягоды", "вода", "сахар"],
        nutrition: { kcal: "80–140", protein: "0–2", fat: "0", carbs: "18–34" },
        price: "от 180 ₽",
        detailImage: "napitki/cart/juices.png"
    }
};

// ==================== ЭЛЕМЕНТЫ ====================
const menuSections = document.querySelectorAll('#menuList');
const yakorya = document.querySelector('.yakorya');
const detailView = document.getElementById('detailView');
const detailContent = document.getElementById('detailContent');
const backBtn = document.getElementById('backBtn');

// ==================== СКРЫТИЕ/ПОКАЗ ====================
function hideAllExceptDetail() {
    menuSections.forEach(section => section.style.display = 'none');
    if (yakorya) yakorya.style.display = 'none';
}
function showAllSections() {
    menuSections.forEach(section => section.style.display = 'block');
    if (yakorya) yakorya.style.display = 'flex';
}

// ==================== ОТРИСОВКА ДЕТАЛЬНОЙ КАРТОЧКИ ====================
function showProductDetail(productId) {
    const p = products[productId];
    if (!p) {
        alert("Информация о напитке временно отсутствует");
        return;
    }

    const html = `
        <div class="detail-two-columns">
            <div class="detail-left">
                <img src="${p.detailImage}" alt="${p.name}">
            </div>
            <div class="detail-right">
                <div class="detail-breadcrumbs">
                    <a href="menu.html">меню</a> / 
                    <a href="napitki.html">напитки</a> / 
                    <span>${p.name}</span>
                </div>
                <h1>${p.name}</h1>
                <div class="detail-subtitle">${p.subtitle}</div>
                <div class="detail-description">${p.description}</div>
                
                <h3>Состав:</h3>
                <ul class="detail-ingredients">
                    ${p.ingredients.map(i => `<li>${i}</li>`).join('')}
                </ul>
                
                <h3>Энергетическая и пищевая ценность:</h3>
                <table class="detail-nutrition">
                    <tr><td>Ккал</td><td>${p.nutrition.kcal}</td></tr>
                    <tr><td>Белки, г</td><td>${p.nutrition.protein}</td></tr>
                    <tr><td>Жиры, г</td><td>${p.nutrition.fat}</td></tr>
                    <tr><td>Углеводы, г</td><td>${p.nutrition.carbs}</td></tr>
                </table>
                
                <div class="detail-price-block">
                    <div class="detail-price">${p.price}</div>
                    <button class="detail-order-btn" data-id="${productId}">заказать</button>
                </div>
            </div>
        </div>
    `;
    detailContent.innerHTML = html;
    hideAllExceptDetail();
    detailView.style.display = 'block';
    detailView.scrollIntoView({ behavior: 'smooth' });
    
    const orderBtn = detailContent.querySelector('.detail-order-btn');
    if (orderBtn) {
        orderBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            alert(`Товар "${p.name}" добавлен в корзину`);
        });
    }
}

// ==================== ВОЗВРАТ С ЗАПОМИНАНИЕМ СЕКЦИИ ====================
let lastSectionId = null;

function backToMenu() {
    showAllSections();
    detailView.style.display = 'none';
    if (lastSectionId) {
        const target = document.getElementById(lastSectionId);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else if (menuSections[0]) menuSections[0].scrollIntoView({ behavior: 'smooth' });
    } else if (menuSections[0]) {
        menuSections[0].scrollIntoView({ behavior: 'smooth' });
    }
}
backBtn.addEventListener('click', backToMenu);

// ==================== ОБРАБОТЧИКИ ДЛЯ ВСЕХ КАРТОЧЕК ====================
// Для обычных карточек (лимонады, коктейли) – открываем детальную карточку
document.querySelectorAll('.card:not([data-id="hot_tea_coffee"]):not([data-id="juice_mors"])').forEach(card => {
    card.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            e.stopPropagation();
            const productId = card.getAttribute('data-id');
            const product = products[productId];
            alert(`Товар "${product ? product.name : 'Напиток'}" добавлен в корзину`);
            return;
        }
        let parentH6 = card.closest('#menuList')?.querySelector('h6');
        if (parentH6 && parentH6.id) lastSectionId = parentH6.id;
        else {
            let el = card.parentElement;
            while (el && el !== document.body) {
                const found = el.querySelector('h6');
                if (found && found.id) { lastSectionId = found.id; break; }
                el = el.parentElement;
            }
        }
        const id = card.getAttribute('data-id');
        if (id && products[id]) showProductDetail(id);
        else alert("Информация о напитке временно отсутствует");
    });
});

// ==================== МОДАЛЬНЫЕ ОКНА ДЛЯ КОФЕ/ЧАЯ И СОКОВ/МОРСОВ ====================
const coffeeTeaModal = document.getElementById('coffeeTeaModal');
const juiceModal = document.getElementById('juiceModal');

// Функция закрытия любого модального окна
function closeModal(modal) {
    if (modal) modal.style.display = 'none';
}
// Закрытие по крестику
document.querySelectorAll('.modal-close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        const modalId = closeBtn.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        closeModal(modal);
    });
});
// Закрытие по клику вне окна
window.addEventListener('click', (e) => {
    if (e.target === coffeeTeaModal) closeModal(coffeeTeaModal);
    if (e.target === juiceModal) closeModal(juiceModal);
});

// Обработчик для кнопки "в корзину" на карточке кофе/чая (data-id="hot_tea_coffee")
const coffeeTeaCard = document.querySelector('.card[data-id="hot_tea_coffee"]');
if (coffeeTeaCard) {
    const coffeeBtn = coffeeTeaCard.querySelector('.special-order-btn');
    if (coffeeBtn) {
        coffeeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            coffeeTeaModal.style.display = 'flex';
        });
    }
    // Также чтобы клик по картинке не открывал детальную карточку (она не нужна для этого товара)
    coffeeTeaCard.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') {
            e.stopPropagation();
            // Можно показать модалку или просто ничего не делать
            coffeeTeaModal.style.display = 'flex';
        }
    });
}

// Обработчик для карточки соков/морсов
const juiceCard = document.querySelector('.card[data-id="juice_mors"]');
if (juiceCard) {
    const juiceBtn = juiceCard.querySelector('.special-order-btn');
    if (juiceBtn) {
        juiceBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            juiceModal.style.display = 'flex';
        });
    }
    juiceCard.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') {
            e.stopPropagation();
            juiceModal.style.display = 'flex';
        }
    });
}

// Выбор опции в модалке кофе/чая
const coffeeOptions = coffeeTeaModal?.querySelectorAll('.garnish-options button');
coffeeOptions?.forEach(btn => {
    btn.addEventListener('click', () => {
        const selected = btn.getAttribute('data-item');
        alert(`Вы заказали: ${selected}`);
        closeModal(coffeeTeaModal);
    });
});

// Выбор опции в модалке соков/морсов
const juiceOptions = juiceModal?.querySelectorAll('.garnish-options button');
juiceOptions?.forEach(btn => {
    btn.addEventListener('click', () => {
        const selected = btn.getAttribute('data-item');
        alert(`Вы заказали: ${selected}`);
        closeModal(juiceModal);
    });
});

// ==================== КНОПКА «НАВЕРХ» ====================
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) backToTop.style.display = 'flex';
    else backToTop.style.display = 'none';
});
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));