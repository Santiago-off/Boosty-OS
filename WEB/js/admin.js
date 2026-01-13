import { app } from "./firebase-config.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, query, where, orderBy, getDocs, getDoc, doc, updateDoc, getCountFromServer } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

let currentAnalysisId = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            // Verificar rol de administrador en Firestore
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
                console.log("Admin logueado:", user.email);
                loadMetrics();
                loadRequests();
            } else {
                alert("Acceso denegado. No tienes permisos de administrador.");
                window.location.href = 'dashboard.html';
            }
        } catch (error) {
            console.error("Error verificando permisos:", error);
            window.location.href = 'index.html';
        }
    } else {
        window.location.href = 'index.html';
    }
});

// --- NAVEGACIÓN ---
const navButtons = {
    'nav-overview': 'section-overview',
    'nav-requests': 'section-requests'
};

Object.keys(navButtons).forEach(btnId => {
    document.getElementById(btnId).addEventListener('click', () => {
        // Actualizar estilos botones
        Object.keys(navButtons).forEach(id => {
            const btn = document.getElementById(id);
            if (id === btnId) {
                btn.className = "w-full text-left px-4 py-2 bg-primary/10 text-primary rounded-xl font-medium transition-colors";
            } else {
                btn.className = "w-full text-left px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-card-bg/50 rounded-xl transition-colors";
            }
        });

        // Mostrar sección
        document.querySelectorAll('.section-content').forEach(sec => sec.classList.add('hidden'));
        document.getElementById(navButtons[btnId]).classList.remove('hidden');
        
        // Actualizar título
        document.getElementById('page-title').textContent = btnId === 'nav-overview' ? 'Resumen del Sistema' : 'Gestión de Solicitudes';
        
        // Si vamos a la pestaña de solicitudes, recargar la lista
        if (btnId === 'nav-requests') loadRequests();
    });
});

// --- LOGOUT ---
document.getElementById('logout-btn').addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = 'index.html';
});

// --- MÉTRICAS ---
async function loadMetrics() {
    try {
        // Contar usuarios
        const usersColl = collection(db, "users");
        const usersSnapshot = await getCountFromServer(usersColl);
        document.getElementById('stat-users').textContent = usersSnapshot.data().count;

        // Contar análisis pendientes
        const pendingQuery = query(collection(db, "analyses"), where("status", "==", "pending"));
        const pendingSnapshot = await getCountFromServer(pendingQuery);
        document.getElementById('stat-pending').textContent = pendingSnapshot.data().count;

        // Contar análisis completados
        const completedQuery = query(collection(db, "analyses"), where("status", "==", "completed"));
        const completedSnapshot = await getCountFromServer(completedQuery);
        document.getElementById('stat-completed').textContent = completedSnapshot.data().count;

    } catch (error) {
        console.error("Error cargando métricas:", error);
    }
}

// --- GESTIÓN DE SOLICITUDES ---
async function loadRequests() {
    const listContainer = document.getElementById('requests-list');
    listContainer.innerHTML = '<p class="text-text-secondary text-center py-10">Cargando solicitudes...</p>';

    try {
        // Obtener todas las solicitudes (ordenamos en cliente para evitar errores de índice)
        const q = query(collection(db, "analyses"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            listContainer.innerHTML = '<p class="text-text-secondary text-center py-10">No hay solicitudes registradas.</p>';
            return;
        }

        // Convertir a array y ordenar
        const requests = [];
        querySnapshot.forEach(doc => requests.push({ id: doc.id, ...doc.data() }));
        
        // Ordenar protegiendo contra fechas nulas
        requests.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateB - dateA;
        });

        let html = '';
        requests.forEach((data) => {
            const id = data.id;
            const date = new Date(data.createdAt).toLocaleString();
            const isPending = data.status === 'pending';
            
            // Estilos según estado
            const statusBadge = isPending 
                ? '<span class="bg-yellow-400/10 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold border border-yellow-400/20">Pendiente</span>'
                : '<span class="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold border border-secondary/20">Completado</span>';

            const actionBtn = isPending
                ? `<button data-id="${id}" data-platform="${data.platform}" data-niche="${data.niche}" class="btn-reply bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Responder</button>`
                : `<button disabled class="bg-card-bg text-text-secondary px-4 py-2 rounded-lg text-sm font-medium border border-card-bg/50 cursor-not-allowed">Respondido</button>`;

            html += `
                <div class="bg-background/50 p-6 rounded-2xl border border-card-bg/50 hover:border-primary/30 transition-colors">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <div class="flex items-center gap-3 mb-1">
                                <span class="font-bold text-white text-lg">${data.platform}</span>
                                <span class="text-sm text-text-secondary">(${data.niche})</span>
                            </div>
                            <p class="text-xs text-text-secondary">ID Usuario: ${data.userId} • ${date}</p>
                        </div>
                        ${statusBadge}
                    </div>
                    
                    <div class="bg-card-bg p-4 rounded-xl border border-card-bg/50 mb-4">
                        <p class="text-sm text-text-primary font-mono break-all">${data.content}</p>
                    </div>

                    ${data.adminResponse ? `<div class="mb-4 text-sm text-text-secondary border-l-2 border-secondary pl-3"><span class="text-secondary font-bold">Tu respuesta:</span> ${data.adminResponse}</div>` : ''}

                    <div class="flex justify-end">
                        ${actionBtn}
                    </div>
                </div>
            `;
        });

        listContainer.innerHTML = html;

    } catch (error) {
        console.error("Error cargando solicitudes:", error);
        listContainer.innerHTML = `
            <div class="text-center py-10 border border-red-500/30 rounded-xl bg-red-500/10">
                <p class="text-red-400 font-bold mb-2">Error al cargar datos</p>
                <p class="text-text-secondary text-sm mb-2">${error.message}</p>
                <p class="text-xs text-text-secondary">Verifica las Reglas de Seguridad en Firebase Console.</p>
            </div>`;
    }
}

// --- EVENT DELEGATION PARA BOTONES ---
// Detectar clic en botones "Responder" dinámicamente
document.getElementById('requests-list').addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-reply');
    if (btn) {
        const { id, platform, niche } = btn.dataset;
        openResponseModal(id, platform, niche);
    }
});

// --- MODAL LOGIC ---
function openResponseModal(id, platform, niche) {
    currentAnalysisId = id;
    const modal = document.getElementById('response-modal');
    const context = document.getElementById('modal-context');
    
    context.innerHTML = `Respondiendo a solicitud de <strong>${platform}</strong> (${niche})`;
    document.getElementById('admin-response-text').value = ''; // Limpiar
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('response-modal').classList.add('hidden');
    document.getElementById('response-modal').classList.remove('flex');
    currentAnalysisId = null;
});

document.getElementById('send-response').addEventListener('click', async () => {
    if (!currentAnalysisId) return;
    
    const responseText = document.getElementById('admin-response-text').value;
    if (!responseText.trim()) return alert("Escribe una respuesta.");

    try {
        const docRef = doc(db, "analyses", currentAnalysisId);
        await updateDoc(docRef, {
            status: 'completed',
            adminResponse: responseText,
            respondedAt: new Date().toISOString()
        });
        
        alert("Respuesta enviada correctamente.");
        document.getElementById('close-modal').click();
        loadRequests(); // Recargar lista
        loadMetrics(); // Actualizar contadores
    } catch (error) {
        console.error("Error enviando respuesta:", error);
        alert("Error: " + error.message);
    }
});

document.getElementById('refresh-btn').addEventListener('click', loadRequests);