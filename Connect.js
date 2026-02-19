const contactForm = document.querySelector('.contact-form'); 
const contactSection = document.querySelector('.contact-section'); 

contactForm.addEventListener('submit', function(e) {
    e.preventDefault(); 

    const userName = document.getElementById('name').value; 

    
    contactForm.classList.add('form-fade-out'); 

    setTimeout(() => {
        
        contactSection.innerHTML = `
            <div class="thank-you-message">
                <img src="./images/sparks.png" alt="success">
                <h2>Thanks for reaching out, ${userName}!</h2>
                <p>Your message has been received. We'll get back to you soon!</p>
                <button onclick="location.reload()" class="submit-btn">Send Another Message</button>
            </div>
        `;
    }, 400);
});

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