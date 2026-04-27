// ==================== ДАННЫЕ О БЛЮДАХ ====================
const products = {
    // ----- БУРГЕРЫ -----
    senna: {
        name: "Бургер \"Айртон Сенна\"",
        subtitle: "(В честь легендарного бразильского пилота Айртона Сенны)",
        description: "Трехкратный чемпион мира, мастер дождливых гонок, человек, который не знал слова \"невозможно\". Так и этот бургер: дерзкий, насыщенный, с характером.",
        ingredients: ["говяжья котлета 200г", "сыр горгонзола 40г", "карамелизированный лук 50г", "соус барбекю 30г", "булка бриошь"],
        nutrition: { kcal: "780", protein: "38", fat: "44", carbs: "52" },
        price: "550 ₽",
        detailImage: "eda/cart/burg_senna.png"
    },
    schumacher: {
        name: "Бургер \"Михаэль Шумахер\"",
        subtitle: "(В честь семикратного чемпиона мира)",
        description: "Этот бургер посвящен человеку, который переписал историю Формулы-1. Михаэль Шумахер — семь титулов, 91 победа, 155 подиумов. Его имя стало синонимом абсолютной надежности, железной воли и безжалостной эффективности. Так и этот бургер: никаких компромиссов, только двойная сила и проверенные временем решения.",
        ingredients: ["говяжья котлета 2х150г", "сыр чеддер 40г", "бекон 30г", "соус чили 30г", "булка бриошь"],
        nutrition: { kcal: "1060", protein: "58", fat: "68", carbs: "52" },
        price: "620 ₽",
        detailImage: "eda/cart/burg_shum.png"
    },
    hamilton: {
        name: "Бургер \"Льюис Хэмилтон\"",
        subtitle: "(Британская элегантность, стиль и бескомпромиссная скорость.)",
        description: "Льюис Хэмилтон — это не просто гонщик, это икона стиля, рекордсмен по количеству побед и человек, который доказал, что скорость может быть изящной. Так и этот бургер: лёгкая, но сытная куриная котлета, нежное гуакамоле, свежие томаты и деликатный соус. Никакой тяжести — только баланс, точность и безупречный вкус.",
        ingredients: ["Куриная котлета 200г", "Гуакамоле 40г", "Томаты 30г", "Легкий соус 20г", "Булка бриошь"],
        nutrition: { kcal: "560", protein: "34", fat: "26", carbs: "44" },
        price: "490 ₽",
        detailImage: "eda/cart/burg_ham.png"
    },
    verstappen: {
        name: "Бургер \"Макс Ферстаппен\"",
        subtitle: "(Голландская дерзость, напор и бескомпромиссная атака)",
        description: "Макс Ферстаппен — это самый молодой чемпион в истории Формулы-1, гонщик, который не боится рисковать, атаковать на грани и проходить там, где другие сбавляют скорость. Его стиль — агрессивный, дерзкий, без права на ошибку. Так и этот бургер: сочная говяжья котлета, жгучие халапеньо, острый соус и хрустящий лук.",
        ingredients: ["говяжья котлета 200г", "халапеньо 25г", "хрустящий лук 30г", "острый соус 25г", "булка бриошь"],
        nutrition: { kcal: "780", protein: "38", fat: "46", carbs: "54" },
        price: "580 ₽",
        detailImage: "eda/cart/burg_max.png"
    },
    alonso: {
        name: "Бургер \"Фернандо Алонсо\"",
        subtitle: "(В честь испанского пилота Фернандо Алонсо — двукратного чемпиона мира, легенды выносливости)",
        description: "Фернандо Алонсо — это гонщик, который умеет выжать максимум из любой машины. Его карьера — это марафон: два титула, десятки побед, возвращения и борьба до последнего круга. Он не сдаётся никогда. Так и этот бургер: сочная говяжья котлета, пикантный бекон, благородный сыр манчего и ароматный соус песто.",
        ingredients: ["говяжья котлета 200г", "бекон 30г", "сыр манчего 40г", "соус песто 25г", "булка бриошь"],
        nutrition: { kcal: "850", protein: "45", fat: "52", carbs: "48" },
        price: "560 ₽",
        detailImage: "eda/cart/burg_alo.png"
    },
    norris: {
        name: "Бургер \"Ландо Норрис\"",
        subtitle: "(Молодость, дерзость и яркий вкус без компромиссов)",
        description: "Ландо Норрис — это новое поколение Формулы-1: быстрый, харизматичный, современный. Он не боится экспериментировать, шутить и быть собой. Так и этот бургер: вместо привычной котлеты — смелая основа из киноа и нута, свежее авокадо для кремовой текстуры и взрывной соус чили-манго.",
        ingredients: ["котлета из киноа и нута 150г", "авокадо 50г", "соус чили-манго 25г", "булка с сыром"],
        nutrition: { kcal: "520", protein: "18", fat: "24", carbs: "62" },
        price: "490 ₽",
        detailImage: "eda/cart/burg_nor.png"
    },

    // ----- ПИЦЦА -----
    pizza_monza: {
        name: "Пицца \"Монца\"",
        subtitle: "(В честь легендарной итальянской трассы Autodromo Nazionale di Monца — храма скорости Формулы-1.)",
        description: "Монца — это не просто трасса, это символ Формулы-1. Самые быстрые прямые, самые громкие моторы и преданная публика. Так и эта пицца: острый пепперони, тягучая моцарелла, жгучий перец и томатный соус. Классика итальянской кухни с дерзким характером. Идеально для просмотра гонки — быстро, горячо и невероятно вкусно.",
        ingredients: ["томатный соус 80г", "моцарелла 120г", "пепперони 80г", "острый перец 10г", "тесто для пиццы 250г"],
        nutrition: { kcal: "1150", protein: "52", fat: "56", carbs: "110" },
        price: "650 ₽",
        detailImage: "eda/cart/piz_monza.png"
    },
    pizza_monaco: {
        name: "Пицца \"Монако\"",
        subtitle: "(Шик, изящество и вкус победителя.)",
        description: "Монако — это не просто гонка, это светское событие. Яхты, шампанское, узкие улицы и шикарные виражи. Так и эта пицца: вместо томатного соуса — нежный белый соус, благородный лосось, свежий шпинат и тягучая моцарелла. Изысканно, легко и дорого. Как победа на Гран-при Монако — ты наслаждаешься каждым моментом.",
        ingredients: ["белый соус 80г", "моцарелла 120г", "лосось 90г", "шпинат 40г", "тесто для пиццы 250г"],
        nutrition: { kcal: "1280", protein: "58", fat: "68", carbs: "102" },
        price: "780 ₽",
        detailImage: "eda/cart/piz_monaco.png"
    },
    pizza_silverstone: {
        name: "Пицца \"Сильверстоун\"",
        subtitle: "(В честь легендарной британской трассы Silverstone Circuit — колыбели Формулы-1)",
        description: "Сильверстоун — это дом британской гонки. Быстрые повороты, история и преданные фанаты. Так и эта пицца: томатный соус, тягучая моцарелла, сытный бекон, ароматные грибы и яйцо сверху. Сытная, мужественная, настоящая. Как финиш на родной земле — уверенно и с чувством выполненного долга.",
        ingredients: ["томатный соус 80г", "моцарелла 120г", "бекон 70г", "грибы 60г", "яйцо 1шт", "тесто для пиццы 250г"],
        nutrition: { kcal: "1220", protein: "56", fat: "62", carbs: "108" },
        price: "690 ₽",
        detailImage: "eda/cart/piz_sil.png"
    },
    pizza_spa: {
        name: "Пицца \"Спа\"",
        subtitle: "(В честь легендарной бельгийской трассы Spa-Francorchamps — королевы скорости с самыми захватывающими поворотами)",
        description: "Спа — это трасса, где всё меняется за секунду: дождь, солнце, обгон на Eau Rouge. Так и эта пицца: вместо томатов — копчёный соус барбекю, сочная курица гриль, пряный красный лук и сладкий перец. Дерзко, ярко, с бельгийским характером. Как идеальный круг по легендарной трассе.",
        ingredients: ["соус барбекью 80г", "моцарелла 120г", "курица гриль 100г", "красный лук 40г", "перец 60г", "тесто для пиццы 250г"],
        nutrition: { kcal: "1180", protein: "58", fat: "52", carbs: "112" },
        price: "670 ₽",
        detailImage: "eda/cart/piz_spa.png"
    },

    // ----- ПАСТА -----
    pasta_carbonara: {
        name: "Карбонара-трасса",
        subtitle: "(Классика, которую не меняют — как легендарные трассы Формулы-1)",
        description: "Карбонара — это как старая добрая трасса: её конфигурация не меняется годами, потому что она идеальна. Спагетти, гуанчиале (вяленые свиные щёчки), свежее яйцо и острый пекорино. Ни сливок, ни чеснока, ни горошка — только настоящий римский рецепт. Просто, честно и гениально. Блюдо для тех, кто ценит традиции.",
        ingredients: ["спагетти 180г", "гуанчиале 60г", "яйцо 1шт", "пекорино романо 40г", "черный перец по вкусу"],
        nutrition: { kcal: "860", protein: "34", fat: "46", carbs: "74" },
        price: "530 ₽",
        detailImage: "eda/cart/carbonara.png"
    },
    pasta_bolognese: {
        name: "Болоньезе-Гран-при",
        subtitle: "(Главное событие итальянского этапа на твоей тарелке)",
        description: "Болоньезе — это как Гран-при: долгое тушение, сложный состав и финальный аккорд, ради которого всё затевалось. Нежнейшая говядина, ароматный томатный соус с овощами и пряностями, долгое томление до состояния «памятного ужина». Главное блюдо для главной гонки.",
        ingredients: ["тольятелле 200г", "мясной соус болоньезе 180г", "пармезан 15г"],
        nutrition: { kcal: "890", protein: "42", fat: "34", carbs: "98" },
        price: "590 ₽",
        detailImage: "eda/cart/boloneze.png"
    },
    pasta_alfredo: {
        name: "Паста Альфредо Феттуччине",
        subtitle: "(Итальянская нежность, которая согревает как домашний этап Ferrari)",
        description: "Альфредо — это самая нежная паста в итальянском меню. Широкие ленты феттуччине, мягкий сливочный соус с пармезаном и сочная курица. Никакой остроты, никаких резких ноток — только уют, гладкость и лёгкое послевкусие, как прогулка по итальянскому побережью. Идеальный выбор для спокойного вечера или для тех, кто хочет отдохнуть от острых бургеров.",
        ingredients: ["феттуччине 180г", "курица 100г", "сливочный соус 120г", "пармезан 15г"],
        nutrition: { kcal: "880", protein: "44", fat: "42", carbs: "80" },
        price: "550 ₽",
        detailImage: "eda/cart/alfredo.png"
    },
    pasta_lasagna: {
        name: "Лазанья Ferrari",
        subtitle: "(Красная, мощная, как болид из Маранелло)",
        description: "Ferrari — это страсть, скорость и безупречный стиль. Так и эта лазанья: слоистое тесто, сочный мясной рагу, нежный соус бешамель и хрустящая сырная корочка. В ней нет ничего лишнего — только мощь, проверенная временем. Как культовый болид, выезжающий на стартовую решётку, это блюдо обещает быть главным событием вашего обеда. Красная, мощная, Ferrari.",
        ingredients: ["листы лазаньи 6-8шт", "мясной соус (болоньезе) 250г", "соус бешамель 150г", "моцарелла 60г", "пармезан 50г"],
        nutrition: { kcal: "980", protein: "52", fat: "54", carbs: "74" },
        price: "590 ₽",
        detailImage: "eda/cart/lazaniya.png"
    },

    // ----- ОСНОВНЫЕ БЛЮДА -----
    main_steak: {
        name: "Стейк пилота",
        subtitle: "(Мощь, сила и чистый протеин для настоящих гонщиков)",
        description: "Стейк пилота — это блюдо для настоящих мужчин и для тех, кто хочет зарядиться как перед долгой гонкой. Рибай на кости или без — мраморная говядина высшего качества, прожарка Medium Rare или Medium, овощи гриль для баланса и насыщенный соус демиглас. Ничего лишнего: только мясо, огонь и характер. Как пилот перед стартом — собран, силён и готов к победе.",
        ingredients: ["стейк рибай 250г", "овощи гриль 120г", "соус демиглас 40г", "соль и перец по вкусу"],
        nutrition: { kcal: "890", protein: "65", fat: "58", carbs: "22" },
        price: "890 ₽",
        detailImage: "eda/cart/stake_1.png"
    },
    main_chicken: {
        name: "Курица-обгон",
        subtitle: "(Быстро, легко, дерзко — как обгон по внешнему радиусу)",
        description: "Курица-обгон — это манёвр, который всегда удаётся. Нежное куриное филе гриль, воздушное картофельное пюре и нежный сливочный соус. Никакой тяжести — только чистый вкус, гладкая текстура и послевкусие победителя. Идеально для обеда, когда нужно быстро набраться сил и не потерять лёгкость.",
        ingredients: ["куриное филе гриль 180г", "картофельное пюре 150г", "сливочный соус 50г"],
        nutrition: { kcal: "590", protein: "42", fat: "28", carbs: "38" },
        price: "590 ₽",
        detailImage: "eda/cart/kura.png"
    },
    main_salmon: {
        name: "Лосось-полюс",
        subtitle: "(Холодная голова, точный расчёт — как финиш на северном полюсе)",
        description: "Лосось-полюс — блюдо для тех, кто привык просчитывать каждый шаг. Стейк норвежского лосося с хрустящей корочкой, рассыпчатая киноа, хрустящая спаржа и освежающий цитрусовый соус. Никакой тяжести — только баланс Омега-3, белка и витаминов. Как пилот, который берёт pole position — холодный ум, точные действия и результат, достойный подиума.",
        ingredients: ["стейк лосося 180г", "киноа 120г", "спаржа 60г", "соус цитрус 40г"],
        nutrition: { kcal: "880", protein: "44", fat: "42", carbs: "80" },
        price: "790 ₽",
        detailImage: "eda/cart/losos.png"
    },
    main_steak2: {
        name: "Рибай-Ред Булл",
        subtitle: "(Энергия на весь заезд — от старта до клетчатого флага)",
        description: "Рибай-Ред Булл — это блюдо для длинной дистанции. 300 граммов мраморной говядины, прожарка Medium Rare, картофельный гарнир и острый перечный соус. Каждый кусок даёт топливо для обгонов, дерзости и финишного рывка. Как энергетик, только натуральный — без банки, но с характером",
        ingredients: ["стейк рибай 300г", "картофель 150г", "перечный соус 50г"],
        nutrition: { kcal: "1180", protein: "70", fat: "78", carbs: "56" },
        price: "990 ₽",
        detailImage: "eda/cart/stake_rb.png"
    }
};

// ==================== ЭЛЕМЕНТЫ ====================
const menuSections = document.querySelectorAll('#menuList');
const yakorya = document.querySelector('.yakorya');
const garnirBlock = document.querySelector('.cont_gar');
const detailView = document.getElementById('detailView');
const detailContent = document.getElementById('detailContent');
const backBtn = document.getElementById('backBtn');

// ==================== СКРЫТИЕ/ПОКАЗ ====================
function hideAllExceptDetail() {
    menuSections.forEach(section => section.style.display = 'none');
    if (yakorya) yakorya.style.display = 'none';
    if (garnirBlock) garnirBlock.style.display = 'none';
}
function showAllSections() {
    menuSections.forEach(section => section.style.display = 'block');
    if (yakorya) yakorya.style.display = 'flex';
    if (garnirBlock) garnirBlock.style.display = 'flex';
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
                    <a href="menu.html#main-dishes">основные блюда</a> / 
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

// ==================== ГАРНИРЫ (МОДАЛЬНОЕ ОКНО) ====================
const garnishModal = document.getElementById('garnishModal');
const garnishClose = document.querySelector('.garnish-modal-close');
const chooseGarnishBtn = document.getElementById('chooseGarnishBtn');

if (chooseGarnishBtn) {
    chooseGarnishBtn.addEventListener('click', () => garnishModal.style.display = 'flex');
}
if (garnishClose) {
    garnishClose.addEventListener('click', () => garnishModal.style.display = 'none');
}
window.addEventListener('click', (e) => {
    if (e.target === garnishModal) garnishModal.style.display = 'none';
});
document.querySelectorAll('.garnish-options button').forEach(btn => {
    btn.addEventListener('click', () => {
        const garnish = btn.getAttribute('data-garnish');
        const price = btn.getAttribute('data-price');
        alert(`Гарнир "${garnish}" (${price}₽) добавлен в корзину`);
        garnishModal.style.display = 'none';
    });
});

// ==================== КНОПКА «НАВЕРХ» ====================
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) backToTop.style.display = 'flex';
    else backToTop.style.display = 'none';
});
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));