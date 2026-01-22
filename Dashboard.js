const hamburger = document.getElementById('hamburger'); 
const mainNav = document.getElementById('main-nav');   


hamburger.addEventListener('click', () => {
    
   
    mainNav.classList.toggle('active');
    
   
    hamburger.classList.toggle('is-open');
});


const navLinks = document.querySelectorAll('.nav-list a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        mainNav.classList.remove('active');
        hamburger.classList.remove('is-open');
    });
});

const quotes = [
    "Small steps lead to big changes.",
    "Consistency is the key to success.",
    "You are doing better than you think!",
    "One day at a time.",
    "Don't stop until you're proud."
];

function displayRandomQuote() {
    const quoteElement = document.getElementById('motivation-quote');
    if (quoteElement) {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        quoteElement.innerText = `✨ ${quotes[randomIndex]}`;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    displayRandomQuote();

});