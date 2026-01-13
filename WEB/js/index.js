import { app } from "./firebase-config.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const auth = getAuth(app);

// Verificar si el usuario ya está logueado al entrar al index
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Si está logueado, cambiamos todos los enlaces de login para que vayan al dashboard
        const loginLinks = document.querySelectorAll('a[href="login.html"]');
        loginLinks.forEach(link => {
            link.textContent = 'Ir al Dashboard';
            link.href = 'dashboard.html';
        });
    }
});