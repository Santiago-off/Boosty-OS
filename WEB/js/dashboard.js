import { app } from "./firebase-config.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

// Verificar estado de autenticación
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Usuario logueado: Mostrar datos básicos
        const email = user.email;
        const userEmailEl = document.getElementById('user-email');
        const userInitialsEl = document.getElementById('user-initials');

        if (userEmailEl) userEmailEl.textContent = email;
        if (userInitialsEl) userInitialsEl.textContent = email.charAt(0).toUpperCase();

        // Obtener datos del plan desde Firestore
        try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const plan = data.plan || 'Gratis';
                
                // Actualizar UI con el plan
                const planEl = document.getElementById('user-plan');
                if (planEl) planEl.textContent = plan.charAt(0).toUpperCase() + plan.slice(1);

                // Calcular fecha de renovación (Fecha de creación + 30 días)
                if (data.createdAt) {
                    const createdDate = new Date(data.createdAt);
                    const renewalDate = new Date(createdDate);
                    renewalDate.setDate(renewalDate.getDate() + 30);
                    
                    const renewalEl = document.getElementById('user-renewal');
                    if (renewalEl) renewalEl.textContent = `Renueva: ${renewalDate.toLocaleDateString('es-ES')}`;
                }
            } else {
                console.log("No se encontraron datos del usuario en Firestore.");
            }
        } catch (error) {
            console.error("Error al obtener datos del usuario:", error);
        }

    } else {
        // Usuario NO logueado: Redirigir al login
        window.location.href = 'index.html';
    }
});

// Lógica de Logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await signOut(auth);
        window.location.href = 'index.html';
    });
}