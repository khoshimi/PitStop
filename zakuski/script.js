// ==================== ДАННЫЕ О ЗАКУСКАХ ====================
const products = {
    // ----- САЛАТЫ -----
    salad_eau: {
        name: "Салат «Eau Rouge»",
        subtitle: "(Знаменитый поворот Spa — резкий, яркий, запоминающийся)",
        description: "Eau Rouge — самый быстрый и опасный поворот в календаре Формулы-1. Так и этот салат: пикантная руккола, сладкая груша, благородный пармезан, хрустящие орехи и медово-горчичная заправка. Сочетание острого, сладкого и кислого — как подъём вверх на пределе скорости. Лёгкий, яркий, с характером. Идеальный выбор перед основной гонкой.",
        ingredients: ["руккола 60г", "груша 70г", "пармезан 20г", "орехи 20г", "медово-горчичный соус 30г"],
        nutrition: { kcal: "390", protein: "14", fat: "28", carbs: "22" },
        price: "450₽",
        detailImage: "zakuski/cart/sal_eau.png"
    },
    salad_cezar: {
        name: "Цезарь-пит-стоп",
        subtitle: "(Классика пит-лейн — быстро, сытно, как смена шин за 2.4 секунды)",
        description: "Пит-стоп в Формуле-1 — это чёткий ритуал, где каждая секунда на счету. Так и этот салат: проверенная классика, идеальный баланс и никакой воды. Курица гриль, хрустящий романо, солёный пармезан, нежное яйцо и густой соус Цезарь. Блюдо, которое не подводит — как механики в боксах. ",
        ingredients: ["Курица гриль 80г", "Романо 60г", "Пармезан 15", "Соус Цезарь 40г", "Яйцо 1шт"],
        nutrition: { kcal: "490", protein: "60", fat: "34", carbs: "16" },
        price: "490₽",
        detailImage: "zakuski/cart/sal_zec.png"
    },
    salad_grech: {
        name: "Греческий обгон",
        subtitle: "(Быстрый и дерзкий — как обгон по внешнему радиусу)",
        description: "Греческий обгон — это салат, который не требует представления. Сочные овощи, пикантная фета, ароматные оливки и щепотка орегано. Всё просто, свежо и дерзко. Никаких лишних ингредиентов — только классика, которая работает всегда. Идеальный выбор, когда нужно быстро перекусить, но без потери вкуса и стиля.",
        ingredients: ["огурцы 80г", "помидоры 80г", "перец 60г", "фета 70г", "маслины 30г", "заправка греческая 30г"],
        nutrition: { kcal: "280", protein: "10", fat: "20", carbs: "16" },
        price: "420₽",
        detailImage: "zakuski/cart/sal_grek.png"
    },
    salad_londo: {
        name: "Салат Норриса",
        subtitle: "(Молодость, яркость и свежий взгляд на классику)",
        description: "Салат Норриса — это заряд энергии и хорошего настроения. Курица терияки добавляет азиатскую ноту и лёгкую сладость, киноа — сытную основу, авокадо — кремовую нежность, а манго — тропическую свежесть. Вместе это тандем ярких текстур и вкусов, который бодрит не хуже финишного круга. Идеальный выбор для тех, кто следит за фигурой, но не готов есть скучно.",
        ingredients: ["Курица терияки 90г", "Киноа 80г", "Авокадо 60г", "Манго 60г", "Заправка по желанию"],
        nutrition: { kcal: "530", protein: "28", fat: "28", carbs: "46" },
        price: "530₽",
        detailImage: "zakuski/cart/sal_nor.png"
    },

    // ----- ЗАКУСКИ -----
    snack_wings: {
        name: "Колесные гайки",
        subtitle: "(Смена колес за 2.4 секунды — быстро, горячо, без права на ошибку)",
        description: "Куриные крылья — это как пит-стоп чемпионов. Никакой возни, только чёткая работа: шесть отборных крылышек, соус на выбор (дымный BBQ или огненный острый), хрустящая корочка и нежное мясо внутри. Идеальная закуска под гонку: не отвлекает от экрана, но даёт полный вкус. Механики бы не справились быстрее.",
        ingredients: ["Куриные крылья 6шт(300 г)", "Соус на выбор 50г"],
        nutrition: { kcal: "680", protein: "42", fat: "46", carbs: "18" },
        price: "390 ₽",
        detailImage: "zakuski/cart/krilia.png"
    },
    snack_nachos: {
        name: "Наггетсы-обгон",
        subtitle: "(Быстрый манёвр — 6 точных попаданий, как шесть кругов без ошибки)",
        description: "Наггетсы — это идеальный обгон на тарелке. Хрустящая панировка, нежное куриное филе внутри и ровно шесть штук — как шесть идеальных кругов подряд. Подаются с соусом на выбор. Никакой возни: взял, макнул, съел. Быстро, вкусно, манёвренно.",
        ingredients: ["Куриные наггетсы 6шт(180г)", "Соус на выбор 30г"],
        nutrition: { kcal: "420", protein: "24", fat: "324", carbs: "30" },
        price: "320 ₽",
        detailImage: "zakuski/cart/nagetsi.png"
    },
    snack_rolls: {
        name: "Спринг-роллы",
        subtitle: "(Резвый старт — 4 хрустящих заезда до первого поворота)",
        description: "Спринг-роллы — это идеальный разгон перед основной дистанцией. Тонкое рисовое тесто, сочная овощная начинка и хруст, который бодрит не хуже зелёного света. Четыре штуки на порцию — как четыре первых круга, когда всё только начинается. Подаются с острым соусом чили. Взрыв вкуса с первой секунды.",
        ingredients: ["Овощные роллы 4шт (180г)", "Соус чили 30г"],
        nutrition: { kcal: "380", protein: "8", fat: "14", carbs: "54" },
        price: "350 ₽",
        detailImage: "zakuski/cart/rolli.png"
    },
    snack_potato: {
        name: "Картошка пилот",
        subtitle: "(VIP-питание — трюфельный вкус для тех, кто привык к первому классу)",
        description: "Обычная картошка фри — это эконом-класс. А это — бизнес-лот. Хрустящая соломка, политая ароматным трюфельным маслом, и щедрая порция тёртого пармезана. Блюдо, которое превращает привычный гарнир в главное событие. Только для настоящих гурманов и тех, кто знает толк в хорошем топливе.",
        ingredients: ["Картошка фри 180г", "Трюфельное масло 10мл", "Пармезан 15г"],
        nutrition: { kcal: "430", protein: "10", fat: "24", carbs: "42" },
        price: "290 ₽",
        detailImage: "zakuski/cart/kartoshka.png"
    },
    snack_cheese: {
        name: "Сырная тарелка",
        subtitle: "(Итальянский этап — три сорта сыра, мёд, орехи и виноградная нота)",
        description: "Три благородных сыра, подобранных как идеальная команда. Мягкий и сливочный, твёрдый и пикантный, с голубой плесенью для остроты — каждый со своим характером. В паре — жидкий мёд и хрустящие орехи. Идеальный выбор для аперитива или лёгкого перекуса под трансляцию. Как итальянский этап в календаре — его ждут, им наслаждаются, о нём помнят.",
        ingredients: ["Три сорта сыра 120г", "Мед 25г", "Орехи 20г"],
        nutrition: { kcal: "580", protein: "22", fat: "44", carbs: "24" },
        price: "790 ₽",
        detailImage: "zakuski/cart/siri.png"
    },
    snack_veg: {
        name: "Овощная нарезка",
        subtitle: "(Зеленая зона — свежесть, хруст и лёгкость после финиша)",
        description: "Сезонные овощи, нарезанные брусочками и кружочками: сочные огурцы, сладкий перец, черри, морковь и сельдерей. Подаётся с ароматным соусом песто из базилика, кедровых орехов и пармезана. Хрустит как асфальт в Монако, а свежесть бьёт в нос, как финишная прямая. Лёгкий перекус без чувства вины.",
        ingredients: ["Свежие овощи 180г", "Соус песто 30г"],
        nutrition: { kcal: "210", protein: "5", fat: "16", carbs: "12" },
        price: "280 ₽",
        detailImage: "zakuski/cart/ovosi.png"
    }
};

// ==================== ЭЛЕМЕНТЫ ====================
const menuSections = document.querySelectorAll('#menuList');
const yakorya = document.querySelector('.yakorya');
const extrasBlock = document.querySelector('.cont_gar'); // блок дополнительных позиций
const detailView = document.getElementById('detailView');
const detailContent = document.getElementById('detailContent');
const backBtn = document.getElementById('backBtn');

// ==================== СКРЫТИЕ/ПОКАЗ ====================
function hideAllExceptDetail() {
    menuSections.forEach(section => section.style.display = 'none');
    if (yakorya) yakorya.style.display = 'none';
    if (extrasBlock) extrasBlock.style.display = 'none';
}
function showAllSections() {
    menuSections.forEach(section => section.style.display = 'block');
    if (yakorya) yakorya.style.display = 'flex';
    if (extrasBlock) extrasBlock.style.display = 'flex';
}

// ==================== ОТРИСОВКА ДЕТАЛЬНОЙ КАРТОЧКИ ====================
function showProductDetail(productId) {
    const p = products[productId];
    if (!p) {
        alert("Информация о блюде временно отсутствует");
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
                    <a href="zackus.html">закуски</a> / 
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

// ==================== НАВЕШИВАНИЕ ОБРАБОТЧИКОВ НА КАРТОЧКИ ====================
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            e.stopPropagation();
            const productId = card.getAttribute('data-id');
            const product = products[productId];
            alert(`Товар "${product ? product.name : 'Блюдо'}" добавлен в корзину`);
            return;
        }
        // Определяем, в какой секции находится карточка
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
        else alert("Информация о блюде временно отсутствует");
    });
});

// ==================== ДОПОЛНИТЕЛЬНЫЕ ПОЗИЦИИ (МОДАЛЬНОЕ ОКНО) ====================
const extraModal = document.getElementById('extraModal');
const extraClose = document.querySelector('.garnish-modal-close');
const chooseExtraBtn = document.getElementById('chooseExtraBtn');

if (chooseExtraBtn) {
    chooseExtraBtn.addEventListener('click', () => extraModal.style.display = 'flex');
}
if (extraClose) {
    extraClose.addEventListener('click', () => extraModal.style.display = 'none');
}
window.addEventListener('click', (e) => {
    if (e.target === extraModal) extraModal.style.display = 'none';
});
document.querySelectorAll('#extraModal .garnish-options button').forEach(btn => {
    btn.addEventListener('click', () => {
        const extraName = btn.getAttribute('data-extra');
        const price = btn.getAttribute('data-price');
        alert(`Добавлено: "${extraName}" (${price}₽)`);
        extraModal.style.display = 'none';
    });
});

// ==================== КНОПКА «НАВЕРХ» ====================
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) backToTop.style.display = 'flex';
    else backToTop.style.display = 'none';
});
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));