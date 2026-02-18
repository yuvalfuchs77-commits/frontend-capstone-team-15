const navToggle = document.querySelector('.nav-toggle');
const backdrop = document.querySelector('.nav-backdrop');


function setMenuOpen(isOpen) {
    
    document.body.classList.toggle('menu-open', isOpen);
    // nav update
    navToggle?.setAttribute('aria-expanded', String(isOpen));
    //Backdrop 
    if (backdrop) {
        backdrop.hidden = !isOpen;
    }
}


navToggle?.addEventListener('click', () => {
    const isOpen = document.body.classList.contains('menu-open');
    setMenuOpen(!isOpen);
});


backdrop?.addEventListener('click', () => setMenuOpen(false));

//close ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') 
        setMenuOpen(false);
});