import { app } from "./firebase-config.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

document.querySelector('form').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Obtener valores del formulario
    // Nota: Asegúrate de que tus inputs en el HTML tengan type="email", type="password"
    const email = document.querySelector('input[type="email"]').value;
    const password = document.querySelector('input[type="password"]').value;
    // Busca el input o select del plan. Si tienes un id="plan" úsalo, si no busca un select genérico
    const planInput = document.getElementById('plan') || document.querySelector('select');
    const plan = planInput ? planInput.value : 'standard';

    try {
        // 1. Crear usuario en Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Guardar datos adicionales en Firestore usando el UID del usuario
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            plan: plan,
            createdAt: new Date().toISOString()
        });

        alert('Usuario registrado con éxito.');
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error("Error al registrar:", error);
        alert("Error: " + error.message);
    }
});