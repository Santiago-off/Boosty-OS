import { app } from "./firebase-config.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const auth = getAuth(app);

// Si el usuario ya está logueado, redirigir directamente al dashboard
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = 'dashboard.html';
    }
});

document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // La redirección ocurrirá automáticamente gracias al onAuthStateChanged de arriba
    } catch (error) {
        console.error("Error login:", error);
        alert('Error al iniciar sesión: ' + error.message);
    }
});