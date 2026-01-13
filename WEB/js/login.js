document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    // Demo login logic
    console.log('Login attempt');
    window.location.href = 'dashboard.html';
});