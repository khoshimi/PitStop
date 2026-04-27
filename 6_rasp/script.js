// ==================== 1. ПАРСИНГ ДАННЫХ ИЗ HTML ====================
function parseRacesFromDOM() {
    const races = [];
    const roundBlocks = document.querySelectorAll('.round');
    roundBlocks.forEach((round, index) => {
        const zagElem = round.querySelector('.round_zag');
        if (!zagElem) return;
        let country = zagElem.innerText.trim().replace(',', '');
        const etapElem = round.querySelector('.round_etapy');
        let etapText = etapElem ? etapElem.innerText.trim() : '';
        const orderMatch = etapText.match(/\d+/);
        const order = orderMatch ? parseInt(orderMatch[0]) : index + 4;
        const dataElem = round.querySelector('.round_data');
        let dateRange = dataElem ? dataElem.innerText.trim() : '';
        let dateStart = '', dateEnd = '';
        if (dateRange) {
            const parts = dateRange.split('-');
            if (parts.length === 2) {
                const [startDayMonth, endDayMonth] = parts;
                const year = 2026;
                const [startDay, startMonth] = startDayMonth.split('.');
                const [endDay, endMonth] = endDayMonth.split('.');
                dateStart = `${year}-${startMonth}-${startDay}`;
                dateEnd = `${year}-${endMonth}-${endDay}`;
            }
        }
        const flagImg = round.querySelector('img');
        const flagSrc = flagImg ? flagImg.getAttribute('src') : '';
        const flag = flagSrc.split('/').pop();
        const parent = round.closest('.blok') || round.parentElement.parentElement;
        const datyBlocks = parent ? parent.querySelectorAll('.daty') : [];
        let hasSprint = false;
        datyBlocks.forEach(daty => {
            if (daty.innerText.includes('спринт')) hasSprint = true;
        });
        let month = 0;
        if (dateStart) month = parseInt(dateStart.split('-')[1]);
        races.push({
            id: order,
            name: country,
            country: country,
            dateStart: dateStart,
            dateEnd: dateEnd,
            hasSprint: hasSprint,
            month: month,
            order: order,
            flag: flag,
            originalElement: parent
        });
    });
    return races;
}

// ==================== 2. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
let allRaces = [];
let currentMonthFilter = 'all';
let currentTypeFilter = 'all';

// ==================== 3. ОБНОВЛЕНИЕ БЛИЖАЙШЕГО ГРАН-ПРИ И ФИЛЬТРАЦИЯ ====================
function renderFilteredRaces() {
    const today = new Date();
    today.setHours(0,0,0,0);
    let filtered = allRaces.filter(race => {
        if (!race.dateEnd) return true;
        const endDate = new Date(race.dateEnd);
        return endDate >= today;
    });
    if (currentMonthFilter !== 'all') {
        filtered = filtered.filter(race => race.month == currentMonthFilter);
    }
    if (currentTypeFilter === 'sprint') {
        filtered = filtered.filter(race => race.hasSprint === true);
    } else if (currentTypeFilter === 'normal') {
        filtered = filtered.filter(race => race.hasSprint === false);
    }
    filtered.sort((a,b) => new Date(a.dateStart) - new Date(b.dateStart));
    
    updateNearestGP(filtered);
    
    const allBlocks = document.querySelectorAll('.blok');
    allBlocks.forEach(block => block.style.display = 'none');
    filtered.forEach(race => {
        if (race.originalElement) {
            race.originalElement.style.display = 'flex';
        }
    });
}

function updateNearestGP(racesList) {
    const nearestDiv = document.querySelector('.avstriya');
    if (!nearestDiv || racesList.length === 0) return;
    const nearest = racesList[0];
    if (!nearest) return;
    const flagImg = nearestDiv.querySelector('img');
    if (flagImg) flagImg.src = `6_rasp/flagi/${nearest.flag}`;
    const zagElem = nearestDiv.querySelector('.avstriya_zag');
    if (zagElem) zagElem.innerText = nearest.name + (nearest.country ? `, ${nearest.country}` : '');
    const etapElem = nearestDiv.querySelector('.avstriya_etapy');
    if (etapElem) etapElem.innerText = `Этап ${nearest.order}.`;
    const dataElem = nearestDiv.querySelector('.avstriya_data');
    if (dataElem && nearest.dateStart && nearest.dateEnd) {
        const start = new Date(nearest.dateStart);
        const end = new Date(nearest.dateEnd);
        const format = (d) => `${d.getDate().toString().padStart(2,'0')}.${(d.getMonth()+1).toString().padStart(2,'0')}`;
        dataElem.innerText = `${format(start)}-${format(end)}`;
    }
}

// ==================== 4. ДОБАВЛЕНИЕ ФИЛЬТРОВ (ПОСЛЕ БЛОКА .daty) ====================
function addFilterControls() {
    const nearestDatys = document.querySelectorAll('.gran_pri .daty');
    if (nearestDatys.length === 0) return;
    const lastDaty = nearestDatys[nearestDatys.length - 1];
    const oldFilters = document.querySelector('.filters');
    if (oldFilters) oldFilters.remove();
    
    const filterDiv = document.createElement('div');
    filterDiv.className = 'filters';
    filterDiv.style.cssText = 'display: flex; gap: 20px; margin: 30px 0; flex-wrap: wrap; align-items: center;';
    
    const monthSelect = document.createElement('select');
    monthSelect.id = 'monthFilter';
    monthSelect.innerHTML = `<option value="all">месяц</option>
        <option value="1">Январь</option><option value="2">Февраль</option><option value="3">Март</option>
        <option value="4">Апрель</option><option value="5">Май</option><option value="6">Июнь</option>
        <option value="7">Июль</option><option value="8">Август</option><option value="9">Сентябрь</option>
        <option value="10">Октябрь</option><option value="11">Ноябрь</option><option value="12">Декабрь</option>`;
    
    const typeSelect = document.createElement('select');
    typeSelect.id = 'typeFilter';
    typeSelect.innerHTML = `<option value="all">тип</option>
        <option value="sprint">Спринт</option>
        <option value="normal">Обычный этап</option>`;
    
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Сбросить фильтры';
    resetBtn.style.cssText = 'width: auto; padding: 0 20px; background: #1A1A1A;';
    
    filterDiv.appendChild(monthSelect);
    filterDiv.appendChild(typeSelect);
    filterDiv.appendChild(resetBtn);
    
    lastDaty.insertAdjacentElement('afterend', filterDiv);
    
    monthSelect.addEventListener('change', (e) => {
        currentMonthFilter = e.target.value;
        renderFilteredRaces();
    });
    typeSelect.addEventListener('change', (e) => {
        currentTypeFilter = e.target.value;
        renderFilteredRaces();
    });
    resetBtn.addEventListener('click', () => {
        monthSelect.value = 'all';
        typeSelect.value = 'all';
        currentMonthFilter = 'all';
        currentTypeFilter = 'all';
        renderFilteredRaces();
    });
}

// ==================== 5. ДЕЛАЕМ СЕССИИ КЛИКАБЕЛЬНЫМИ (БЕЗ ПОДЧЁРКИВАНИЯ) ====================
function makeSessionsClickable() {
    const sessionNames = ['практика', 'квалификация', 'спринт', 'гонка'];
    const allTextNodes = document.querySelectorAll('.daty .avstriya_etapy, .daty .round_etapy, .gran_pri .daty .avstriya_etapy');
    
    allTextNodes.forEach(el => {
        const text = el.innerText.trim().toLowerCase();
        if (sessionNames.some(s => text.includes(s))) {
            const originalText = el.innerText;
            const parentData = el.closest('.data1');
            if (!parentData) return;
            
            let eventDate = '', eventTime = '';
            const dateElem = parentData.querySelector('.avstriya_datatoch, .round_datatoch');
            if (dateElem) eventDate = dateElem.innerText.trim();
            const timeElem = parentData.querySelector('.time');
            if (timeElem) eventTime = timeElem.innerText.trim();
            
            const link = document.createElement('span');
            link.className = 'booking-session-link';
            link.innerText = originalText;
            link.style.cssText = 'cursor: pointer; color: #BFBFBF; transition: 0.2s;';
            link.addEventListener('mouseenter', () => link.style.color = '#7D0000');
            link.addEventListener('mouseleave', () => link.style.color = '#BFBFBF');
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                let fullDate = '';
                if (eventDate) {
                    const [day, month] = eventDate.split('.');
                    fullDate = `2026-${month}-${day}`;
                }
                let startTime = '';
                if (eventTime) {
                    startTime = eventTime.split('-')[0];
                }
                openBookingModalWithDateTime(fullDate, startTime);
            });
            el.innerHTML = '';
            el.appendChild(link);
        }
    });
}

function openBookingModalWithDateTime(date, time) {
    const modal = document.getElementById('bookingModal');
    if (!modal) return;
    const dateInput = document.getElementById('bookingDate');
    const startTimeInput = document.getElementById('bookingTimeStart');
    if (dateInput && date) dateInput.value = date;
    if (startTimeInput && time) startTimeInput.value = time;
    modal.style.display = 'flex';
}

// ==================== 6. КАРТА ЗАЛА ====================
function createBookingModal() {
    const oldModal = document.getElementById('bookingModal');
    if (oldModal) oldModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'bookingModal';
    modal.className = 'modal-booking';
    modal.style.cssText = 'display: none; position: fixed; z-index: 2000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.85); justify-content: center; align-items: center;';
    
    const content = document.createElement('div');
    content.className = 'modal-booking-content';
    content.style.cssText = 'background: #1A1A1A; border: 2px solid #7D0000; border-radius: 20px; padding: 25px; max-width: 1000px; width: 95%; max-height: 90vh; overflow-y: auto; color: white; position: relative;';
    
    const closeSpan = document.createElement('span');
    closeSpan.innerHTML = '&times;';
    closeSpan.style.cssText = 'position: absolute; top: 15px; right: 20px; font-size: 32px; cursor: pointer; color: #aaa;';
    closeSpan.onclick = () => modal.style.display = 'none';
    content.appendChild(closeSpan);
    
    const title = document.createElement('h3');
    title.innerText = 'Схема зала';
    title.style.cssText = 'text-align: center; font-family: "Zag", sans-serif; font-size: 28px; margin-bottom: 20px; color: #fff;';
    content.appendChild(title);
    
    const scheme = document.createElement('div');
    scheme.className = 'hall-scheme';
    
    const screen = document.createElement('div');
    screen.className = 'screen-area';
    screen.innerText = '🖥️ ЭКРАН';
    scheme.appendChild(screen);
    
    const zonesContainer = document.createElement('div');
    zonesContainer.className = 'zones-container';
    
    const zones = [
        { name: 'Зона 1', tables: [
            { row: 'верхний', numbers: [3,4,5,6], seats: 2 },
            { row: 'нижний', numbers: [1,2], seats: 4 }
        ]},
        { name: 'Зона 2', tables: [
            { row: 'верхний', numbers: [3,4,5], seats: 2 },
            { row: 'нижний', numbers: [1,2], seats: 4 }
        ]},
        { name: 'Зона 3', tables: [
            { row: 'верхний', numbers: [3,4,5], seats: 2 },
            { row: 'нижний', numbers: [1,2], seats: 4 }
        ]},
        { name: 'Зона 4', tables: [
            { row: 'верхний', numbers: [3,4,5], seats: 2 },
            { row: 'нижний', numbers: [1,2], seats: 4 }
        ]}
    ];
    
    zones.forEach(zone => {
        const zoneDiv = document.createElement('div');
        zoneDiv.className = 'zone-card';
        const zoneTitle = document.createElement('div');
        zoneTitle.className = 'zone-title';
        zoneTitle.innerText = zone.name;
        zoneDiv.appendChild(zoneTitle);
        
        zone.tables.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'table-row';
            row.numbers.forEach(num => {
                const tableDiv = document.createElement('div');
                tableDiv.className = 'table-item';
                tableDiv.dataset.tableName = `Стол ${num} (${zone.name})`;
                tableDiv.innerHTML = `<div class="table-number">Стол ${num}</div><div class="table-seats">${row.seats} места</div>`;
                tableDiv.addEventListener('click', () => {
                    document.getElementById('selectedTableName').innerText = tableDiv.dataset.tableName;
                    document.querySelectorAll('.table-item').forEach(t => t.classList.remove('selected'));
                    tableDiv.classList.add('selected');
                });
                rowDiv.appendChild(tableDiv);
            });
            zoneDiv.appendChild(rowDiv);
        });
        zonesContainer.appendChild(zoneDiv);
    });
    scheme.appendChild(zonesContainer);
    
    const singleTitle = document.createElement('div');
    singleTitle.style.cssText = 'font-family: "Zag", sans-serif; font-size: 20px; text-align: center; margin: 20px 0 10px; color: #7D0000;';
    singleTitle.innerText = 'Отдельные столики';
    scheme.appendChild(singleTitle);
    
    const singleContainer = document.createElement('div');
    singleContainer.className = 'single-tables';
    for (let i = 5; i <= 9; i++) {
        const tableDiv = document.createElement('div');
        tableDiv.className = 'table-item';
        tableDiv.style.minWidth = '80px';
        tableDiv.dataset.tableName = `Стол ${i}`;
        tableDiv.innerHTML = `<div class="table-number">Стол ${i}</div><div class="table-seats">2 места</div>`;
        tableDiv.addEventListener('click', () => {
            document.getElementById('selectedTableName').innerText = tableDiv.dataset.tableName;
            document.querySelectorAll('.table-item').forEach(t => t.classList.remove('selected'));
            tableDiv.classList.add('selected');
        });
        singleContainer.appendChild(tableDiv);
    }
    scheme.appendChild(singleContainer);
    
    const orderDesk = document.createElement('div');
    orderDesk.className = 'order-desk';
    orderDesk.innerText = '🍽️ СТОЛ ДЛЯ ЗАКАЗОВ';
    scheme.appendChild(orderDesk);
    
    content.appendChild(scheme);
    
    const bookingForm = document.createElement('div');
    bookingForm.className = 'booking-form';
    bookingForm.style.cssText = 'display: flex; flex-direction: column; gap: 15px; margin-top: 20px;';
    bookingForm.innerHTML = `
        <label style="display: flex; justify-content: space-between; align-items: center; gap: 15px;">Дата: <input type="date" id="bookingDate" style="background:#2a2a2a; border:1px solid #7D0000; padding:8px; border-radius:8px; color:white;"></label>
        <label style="display: flex; justify-content: space-between; align-items: center; gap: 15px;">Время начала: <input type="time" id="bookingTimeStart" style="background:#2a2a2a; border:1px solid #7D0000; padding:8px; border-radius:8px; color:white;"></label>
        <label style="display: flex; justify-content: space-between; align-items: center; gap: 15px;">Время окончания: <input type="time" id="bookingTimeEnd" style="background:#2a2a2a; border:1px solid #7D0000; padding:8px; border-radius:8px; color:white;"></label>
        <label style="display: flex; justify-content: space-between; align-items: center; gap: 15px;">Выбранный столик: <span id="selectedTableName" style="color:#7D0000; font-weight:bold;">не выбран</span></label>
        <button id="confirmBookingBtn" style="background:#7D0000; border:none; padding:12px; border-radius:40px; color:white; cursor:pointer; font-family:'Zag'; font-size:18px;">Забронировать</button>
    `;
    content.appendChild(bookingForm);
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
    
    const confirmBtn = content.querySelector('#confirmBookingBtn');
    confirmBtn.onclick = () => {
        const date = document.getElementById('bookingDate').value;
        const start = document.getElementById('bookingTimeStart').value;
        const end = document.getElementById('bookingTimeEnd').value;
        const table = document.getElementById('selectedTableName').innerText;
        if (!date || !start || !end || table === 'не выбран') {
            alert('Заполните все поля и выберите столик');
            return;
        }
        alert(`Столик "${table}" забронирован на ${date} с ${start} до ${end}.`);
        modal.style.display = 'none';
    };
}

// ==================== 7. ЗАПУСК ====================
document.addEventListener('DOMContentLoaded', () => {
    allRaces = parseRacesFromDOM();
    renderFilteredRaces();
    addFilterControls();
    createBookingModal();
    makeSessionsClickable();
    
    const bookBtn = document.querySelector('.kanopka button');
    if (bookBtn) {
        bookBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('bookingModal').style.display = 'flex';
        });
    }
});