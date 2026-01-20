import { app } from "./firebase-config.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, addDoc, collection, query, where, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

                // Cargar datos en formulario de configuración
                if (data.dob) document.getElementById('settings-dob').value = data.dob;
                if (data.phone) document.getElementById('settings-phone').value = data.phone;
                if (data.paymentMethod) document.getElementById('settings-payment').value = data.paymentMethod;

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

        // Cargar historial de análisis
        loadAnalysisHistory(user.uid);

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

// --- LÓGICA DE NAVEGACIÓN (SPA) ---
const navButtons = {
    'nav-dashboard': 'section-dashboard',
    'nav-analysis': 'section-analysis',
    'nav-settings': 'section-settings'
};

Object.keys(navButtons).forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) {
        btn.addEventListener('click', () => {
            // 1. Actualizar estilos de botones
            Object.keys(navButtons).forEach(id => {
                const b = document.getElementById(id);
                if (id === btnId) {
                    b.className = "w-full text-left px-4 py-2 bg-primary/10 text-primary rounded-xl font-medium transition-colors";
                } else {
                    b.className = "w-full text-left px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-card-bg/50 rounded-xl transition-colors";
                }
            });

            // 2. Mostrar sección correspondiente
            const sectionId = navButtons[btnId];
            document.querySelectorAll('.section-content').forEach(sec => sec.classList.add('hidden'));
            document.getElementById(sectionId).classList.remove('hidden');

            // 3. Actualizar título
            const titles = {
                'nav-dashboard': 'Panel de Control',
                'nav-analysis': 'Mis Análisis',
                'nav-settings': 'Configuración'
            };
            document.getElementById('page-title').textContent = titles[btnId];
        });
    }
});

// --- LÓGICA DE NUEVO ANÁLISIS ---
const analysisForm = document.getElementById('new-analysis-form');
if (analysisForm) {
    analysisForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return;

        const platform = document.getElementById('analysis-platform').value;
        const niche = document.getElementById('analysis-niche').value;
        const content = document.getElementById('analysis-content').value;
        const btn = analysisForm.querySelector('button');

        try {
            btn.textContent = "Enviando...";
            btn.disabled = true;

            await addDoc(collection(db, "analyses"), {
                userId: user.uid,
                platform: platform,
                niche: niche,
                content: content,
                status: 'pending', // pending, completed
                createdAt: new Date().toISOString(),
                adminResponse: null
            });

            alert("Análisis enviado correctamente. Lo verás en la sección 'Análisis'.");
            analysisForm.reset();
            // Redirigir visualmente a la pestaña de análisis
            document.getElementById('nav-analysis').click();

        } catch (error) {
            console.error("Error al enviar análisis:", error);
            alert("Error: " + error.message);
        } finally {
            btn.textContent = "Enviar a analizar";
            btn.disabled = false;
        }
    });
}

// --- LÓGICA DE CONFIGURACIÓN ---
const settingsForm = document.getElementById('settings-form');
if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return;

        const dob = document.getElementById('settings-dob').value;
        const phone = document.getElementById('settings-phone').value;
        const payment = document.getElementById('settings-payment').value;

        try {
            await updateDoc(doc(db, "users", user.uid), {
                dob: dob,
                phone: phone,
                paymentMethod: payment
            });
            alert("Configuración guardada correctamente.");
        } catch (error) {
            console.error("Error al guardar configuración:", error);
            alert("Error: " + error.message);
        }
    });
}

// --- FUNCIÓN PARA CARGAR HISTORIAL ---
function loadAnalysisHistory(userId) {
    const q = query(collection(db, "analyses"), where("userId", "==", userId), orderBy("createdAt", "desc"));
    
    onSnapshot(q, (snapshot) => {
        const fullList = document.getElementById('full-history-list');
        const miniList = document.getElementById('mini-history-list');
        
        if (!fullList) return;

        let html = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = new Date(data.createdAt).toLocaleDateString();
            const statusColor = data.status === 'completed' ? 'text-secondary bg-secondary/20' : 'text-yellow-400 bg-yellow-400/20';
            const statusText = data.status === 'completed' ? 'Completado' : 'Pendiente';

            html += `
                <div class="p-4 bg-background/50 rounded-xl border border-card-bg/50">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <span class="font-semibold text-white">${data.platform} - ${data.niche}</span>
                            <p class="text-xs text-text-secondary">${date}</p>
                        </div>
                        <span class="text-xs ${statusColor} px-2 py-1 rounded-full">${statusText}</span>
                    </div>
                    <p class="text-sm text-text-secondary truncate">${data.content}</p>
                    ${data.adminResponse ? `<div class="mt-3 p-3 bg-card-bg rounded-lg text-sm border-l-2 border-primary"><span class="text-primary font-bold">Respuesta:</span> ${data.adminResponse}</div>` : ''}
                </div>
            `;
        });

        if (html === '') html = '<p class="text-text-secondary">No hay análisis aún.</p>';

        fullList.innerHTML = html;
        if (miniList) miniList.innerHTML = html; // Reutilizamos el HTML para la vista mini
    });
}

// --- LÓGICA DE PAGOS ---
const paymentSelect = document.getElementById('settings-payment');
const paymentContainer = document.getElementById('payment-integration');
const paypalContainer = document.getElementById('paypal-button-container');
const cryptoContainer = document.getElementById('crypto-payment-info');

if (paymentSelect) {
    paymentSelect.addEventListener('change', (e) => {
        const method = e.target.value;
        
        // Mostrar contenedor principal si hay selección
        if (paymentContainer) {
            if (method) paymentContainer.classList.remove('hidden');
            else paymentContainer.classList.add('hidden');
        }

        // Ocultar todos los métodos específicos primero
        if (paypalContainer) paypalContainer.classList.add('hidden');
        if (cryptoContainer) cryptoContainer.classList.add('hidden');

        if (method === 'paypal') {
            if (paypalContainer) paypalContainer.classList.remove('hidden');
            loadPayPal();
        } else if (method === 'crypto') {
            if (cryptoContainer) cryptoContainer.classList.remove('hidden');
        }
    });
}

function loadPayPal() {
    // Evitar cargar el script múltiples veces
    if (document.getElementById('paypal-sdk')) {
        renderPayPalButtons();
        return;
    }

    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    // CLIENT-ID 'sb' es para Sandbox (Pruebas). Se cambiará por el real más adelante.
    script.src = "https://www.paypal.com/sdk/js?client-id=sb&currency=USD";
    script.onload = () => renderPayPalButtons();
    document.body.appendChild(script);
}

function renderPayPalButtons() {
    const container = document.getElementById('paypal-button-container');
    if (window.paypal && container) {
        container.innerHTML = ''; // Limpiar botones anteriores
        window.paypal.Buttons({
            style: { layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' },
            createOrder: (data, actions) => {
                return actions.order.create({
                    purchase_units: [{ amount: { value: '29.00' } }] // Valor placeholder
                });
            },
            onApprove: (data, actions) => {
                return actions.order.capture().then((details) => {
                    alert('Pago completado por ' + details.payer.name.given_name);
                    // Aquí se añadiría la lógica para actualizar la base de datos
                });
            },
            onError: (err) => {
                console.error('Error PayPal:', err);
            }
        }).render('#paypal-button-container');
    }
}