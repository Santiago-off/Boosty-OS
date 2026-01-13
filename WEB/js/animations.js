
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px', // Activa un poco antes de que el elemento esté totalmente visible
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Solo animar una vez
            }
        });
    }, observerOptions);

    const elements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .scale-in');
    elements.forEach(el => observer.observe(el));
});