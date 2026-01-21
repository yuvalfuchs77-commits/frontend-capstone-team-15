// =========================
// Storage + Seed Date
// =========================
const STORAGE_KEY = 'habitflow_habits_v1';
const SETTINGS_KEY = 'habitflow_settings_v1';

function todayISO(){
    const d = new Date();
    d.setHours(0,0,0,0);
    return d.toISOString().slice(0,10);
}

function addDaysISO(isoDate, delta){
    const d = new Date(isoDate + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    return d.toISOString().slice(0,10);
}

function uniqueSorted(dates){
    return Array.from(new Set(dates)).sort();
}

function loadHabits(){
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function saveHabits(habits){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function loadSettings(){
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function saveSettings(settings){
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Seed habits (first run only)
const SEED_HABITS = [
    { id: 1, title: 'Morning Stretch', category: 'Health', frequency: 'daily', completionDates: [] },
    { id: 2, title: 'Read 10 Pages', category: 'Learning', frequency: 'daily', completionDates: [] },
    { id: 3, title: 'Deep Work', category: 'Productivity', frequency: 'daily', completionDates: [] },
    { id: 4, title: 'Meditation', category: 'Mindfulness', frequency: 'daily', completionDates: [] },
];

let habits = loadHabits() || structuredClone(SEED_HABITS);
if (!loadHabits()) saveHabits(habits);

let settings = loadSettings() || {
// Reminders stored in LocalStorage 
    remindersEnabled: false,
    reminderTime: '20:00', // HH:MM 
};
if (!loadSettings()) saveSettings(settings);

// =========================
// DOM refs
// =========================
const habitsGrid = document.querySelector('.habits-grid');
const filterButtons = document.querySelectorAll('.filter-btn');

const addHabitBtn = document.querySelector('.btn-add-habit');
const modal = document.getElementById('add-habit-modal');
const closeModalBtn = document.querySelector('.btn-close-modal');
const cancelBtn = document.querySelector('.btn-cancel');

const habitForm = document.getElementById('new-habit-form');
const habitNameInput = document.getElementById('habit-name');
const habitCategorySelect = document.getElementById('habit-category');
const habitFrequencySelect = document.getElementById('habit-frequency');

const modalTitle = document.getElementById('modalTitle');
const habitReminderTimeInput = document.getElementById('habit-reminder-time');

const deleteHabitBtn = document.getElementById('btn-delete-habit');



// edit state
let editingHabitId = null;

// =========================
// Helpers (icons, ids, streak)
// =========================
function getNextHabitId(){
    const ids = habits.map(h => Number(h.id)).filter(n => Number.isFinite(n));
    return (ids.length ? Math.max(...ids) : 0) + 1;
}
    
function labelFromCategoryValue(value){
    const map = {
        health: 'Health',
        learning: 'Learning',
        mindfulness: 'Mindfulness',
        productivity: 'Productivity'
    };
    return map[value] || (value ? (value[0].toUpperCase() + value.slice(1)) : 'General');
}
    
function iconFromCategoryLabel(label){
    const map = {
        Health: './images/heart.png',
        Learning: './images/open-book.png',
        Mindfulness: './images/sun-2.png',
        Productivity: './images/flash.png'
    };
    return map[label] || './images/sun-logo.png';
}
        
function isCompletedOn(habit, isoDate){
    return (habit.completionDates || []).includes(isoDate);
}
        
function computeDailyStreak(habit){
    const dates = uniqueSorted(habit.completionDates || []);
    if (!dates.length) return 0;
        
    const today = todayISO();
    // If not completed today, streak counts up to yesterday 
    let cursor = isCompletedOn(habit, today) ? today : addDaysISO(today, -1);
        
    const set = new Set(dates);
    let streak = 0;
    while (set.has(cursor)) {
    streak += 1;
    cursor = addDaysISO(cursor, -1);
    }
    return streak;
}
        
function computeStreak(habit){
    //  daily streak. 
    return computeDailyStreak(habit);
}

// =========================
// Render (READ)
// =========================
function createHabitCard(habit){
    const article = document.createElement('article');
    article.className = 'habit-card';
    article.dataset.habitId = String(habit.id);
    article.dataset.category = habit.category;
    
    const streak = computeStreak(habit);
    const today = todayISO();
    const completedToday = isCompletedOn(habit, today);
    if (completedToday) article.classList.add('completed');
    
    // card template generated from habit object
    article.innerHTML = `
    <img class="habit-icon" src="${iconFromCategoryLabel(habit.category)}" alt="${habit.category} habit icon" />
    
    <button class="btn-delete" type="button" aria-label="Delete habit"></button>
    
    <!-- === Edit button for UPDATE === -->
    <button class="btn-edit" type="button" aria-label="Edit habit">Edit</button>
    
    <div class="habit-info">
        <h3 class="habit-title"></h3>
        <span class="category"></span>
    </div>
    
    <div class="habit-footer">
        <span class="streak-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16m0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15"/>
            </svg>
            <span class="streak-text">${streak} day${streak === 1 ? '' : 's'}</span>
        </span>
    
        <button class="btn-status" type="button">${completedToday ? 'Done' : 'Do it'}</button>
    </div>
    `;
    
    article.querySelector('.habit-title').innerText = habit.title;
    article.querySelector('.category').innerText = habit.category;
    
    return article;
}
    
function renderHabits(){
    habitsGrid.innerHTML = '';
    habits.forEach(h => habitsGrid.appendChild(createHabitCard(h)));
    applyCurrentFilter();
}
    
function applyCurrentFilter(){
    const activeBtn = document.querySelector('.filter-btn.active');
    const filter = activeBtn?.dataset.filter || 'All';
    document.querySelectorAll('.habit-card').forEach((card) => {
        const cat = card.dataset.category;
        card.style.display = (filter === 'All' || cat === filter) ? '' : 'none';
    });
}
    
renderHabits();

// =========================
//  Filters
// =========================
filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-checked', 'true');
    
    applyCurrentFilter();
    });
});

// =========================
// 6) Modal Open/Close (Create + Update)
// =========================
function openModal(){
    modal.classList.remove('hidden');
}

function closeModal(){
    modal.classList.add('hidden');
    editingHabitId = null;
}
    
addHabitBtn?.addEventListener('click', () => {
    // === Create mode ===
    editingHabitId = null;
    modalTitle.innerText = 'New Ritual';
    habitForm.reset();

    deleteHabitBtn?.classList.add('hidden');

    openModal();
});
    
closeModalBtn?.addEventListener('click', closeModal);
cancelBtn?.addEventListener('click', closeModal);
    
habitForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = habitNameInput.value.trim();
    if (!title) return;
    
    const categoryLabel = labelFromCategoryValue(habitCategorySelect.value);
    const frequency = habitFrequencySelect.value || 'daily';
    
    if (editingHabitId) {
        // === UPDATE ===
        const idx = habits.findIndex(h => String(h.id) === String(editingHabitId));
        if (idx !== -1) {
            habits[idx].title = title;
            habits[idx].category = categoryLabel;
            habits[idx].frequency = frequency;
            saveHabits(habits);
            renderHabits();
        }
    } else {
        // === CREATE ===
        const id = getNextHabitId();
        const newHabit = {
            id,
            title,
            category: categoryLabel,
            frequency,
            reminderTime: habitReminderTimeInput.value || null,
            completionDates: [],
        };
        habits.unshift(newHabit);
        saveHabits(habits);
        renderHabits();
    }
    
    closeModal();
});

deleteHabitBtn?.addEventListener('click', () => {
    if (!editingHabitId) return;
    
    habits = habits.filter(h => String(h.id) !== String(editingHabitId));
    saveHabits(habits);
    renderHabits();
    closeModal();
});

// =========================
// Toast
// =========================
function showToast(message) {
    const toast = document.getElementById('toast-notification');
    const habitSpan = document.getElementById('completed-habit-name');
    
    habitSpan.textContent = message;
    toast.classList.remove('hidden');
    
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => {
        toast.classList.add('hidden');
    }, 2500);
}
// =========================
// Card Actions (Do it / Delete / Edit) – using event delegation
// =========================
document.addEventListener('click', (event) => {
    const statusBtn = event.target.closest('.btn-status');
    if (statusBtn) {
        const habitCard = statusBtn.closest('.habit-card');
        const id = habitCard.dataset.habitId;
        const habit = habits.find(h => String(h.id) === String(id));
        if (!habit) return;
    
        const today = todayISO();
        const dates = new Set(habit.completionDates || []);
    
        // === toggle completion for today and recompute streak automatically ===
        if (dates.has(today)) {
            dates.delete(today);
            habitCard.classList.remove('completed');
            statusBtn.innerText = 'Do it';
        } else {
            dates.add(today);
            habitCard.classList.add('completed');
            statusBtn.innerText = 'Done';
            showToast(habit.title);
        }
    
        habit.completionDates = Array.from(dates);
        saveHabits(habits);
    
        const streak = computeStreak(habit);
        const streakEl = habitCard.querySelector('.streak-text');
        if (streakEl) streakEl.innerText = `${streak} day${streak === 1 ? '' : 's'}`;
    
        return;
    }
    
    const delBtn = event.target.closest('.btn-delete');
    if (delBtn) {
        const habitCard = delBtn.closest('.habit-card');
        const id = habitCard.dataset.habitId;
    
        // === DELETE persisted ===
        habits = habits.filter(h => String(h.id) !== String(id));
        saveHabits(habits);
        habitCard.remove();
        return;
    }
    
    const editBtn = event.target.closest('.btn-edit');
    if (editBtn) {
        const habitCard = editBtn.closest('.habit-card');
        const id = habitCard.dataset.habitId;
        const habit = habits.find(h => String(h.id) === String(id));
        if (!habit) return;
    
        // === UPDATE via modal ===
        editingHabitId = habit.id;
        modalTitle.innerText = 'Edit Habit';

        deleteHabitBtn?.classList.remove('hidden');
    
        habitNameInput.value = habit.title;
    
        // map label -> select value
        const labelToValue = {
            Health: 'health',
            Learning: 'learning',
            Mindfulness: 'mindfulness',
            Productivity: 'productivity'
        };
        habitCategorySelect.value = labelToValue[habit.category] || 'health';
        habitFrequencySelect.value = habit.frequency || 'daily';
    
        openModal();
        return;
    }
});

// =========================
// Reminders (LocalStorage)
// =========================
// -in-app reminder check (simple).
// - Stores settings in LocalStorage.
// - When enabled, shows a toast at the chosen time if a habit is NOT completed today.
function checkReminders(){
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const current = `${hh}:${mm}`;
  
    const today = todayISO();
  
    habits.forEach(habit => {
      if (!habit.reminderTime) return;
      if (habit.reminderTime !== current) return;
      if (isCompletedOn(habit, today)) return;
  
      showToast(`Reminder: ${habit.title}`);
    });
}
    
setInterval(checkReminders, 30 * 1000);

        
// ===== Mobile menu toggle =====
const navToggle = document.querySelector('.nav-toggle');
const backdrop = document.querySelector('.nav-backdrop');

function setMenuOpen(isOpen){
    document.body.classList.toggle('menu-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    backdrop.hidden = !isOpen;
}

navToggle?.addEventListener('click', () => {
    const isOpen = document.body.classList.contains('menu-open');
    setMenuOpen(!isOpen);
});

backdrop?.addEventListener('click', () => setMenuOpen(false));

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') 
        setMenuOpen(false);
});

