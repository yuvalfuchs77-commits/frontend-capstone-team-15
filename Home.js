const navToggle = document.querySelector('.hamburger'); // ב-Home קראת לזה hamburger
const backdrop = document.querySelector('.nav-backdrop');

function setMenuOpen(isOpen) {
    // 1. הוספת/הסרת קלאס ל-body
    document.body.classList.toggle('menu-open', isOpen);
    
    // 2. עדכון נגישות (Accessibility)
    if (navToggle) {
        navToggle.setAttribute('aria-expanded', String(isOpen));
    }

    // 3. הצגה/הסתרה של הרקע הכהה
    if (backdrop) {
        backdrop.hidden = !isOpen;
    }
}

// לחיצה על כפתור ההמבורגר
navToggle?.addEventListener('click', () => {
    const isOpen = document.body.classList.contains('menu-open');
    setMenuOpen(!isOpen);
});

// סגירה בלחיצה על הרקע הכהה
backdrop?.addEventListener('click', () => setMenuOpen(false));

// סגירה בלחיצה על מקש ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenuOpen(false);
});