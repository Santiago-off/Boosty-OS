// security.js - Medidas de Seguridad del Lado del Cliente
// IMPORTANTE: Estas medidas son disuasorias, no infalibles.
// Un usuario con conocimientos puede eludirlas. La única forma de proteger
// la lógica de negocio crítica es mantenerla en el servidor (backend).

(function() {
    'use strict';

    // 1. Deshabilitar Menú Contextual (Click Derecho)
    // Dificulta la inspección rápida de elementos.
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // 2. Deshabilitar Atajos de Teclado para Desarrollo
    // Bloquea las combinaciones de teclas más comunes para abrir las DevTools.
    document.addEventListener('keydown', (e) => {
        // Bloquear F12
        if (e.key === 'F12') {
            e.preventDefault();
        }
        // Bloquear Ctrl+Shift+I, J, C
        if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
            e.preventDefault();
        }
        // Bloquear Ctrl+U (Ver código fuente)
        if (e.ctrlKey && e.key.toLowerCase() === 'u') {
            e.preventDefault();
        }
    });

    // 3. Detección de Herramientas de Desarrollo (DevTools)
    // Combina varias técnicas para una detección más robusta.
    const threshold = 160; // Umbral en píxeles para detectar DevTools abiertas
    let devtoolsOpen = false;

    function detectDevTools() {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;

        // La trampa del depurador mide el tiempo de ejecución. Si es alto, las DevTools están abiertas.
        const startTime = performance.now();
        (function() {}['constructor']('debugger')());
        const endTime = performance.now();

        if (widthThreshold || heightThreshold || (endTime - startTime > 100)) {
            if (!devtoolsOpen) {
                // Acción de bloqueo: Reemplaza el contenido de la página.
                document.body.innerHTML = '<div style="position:fixed; inset:0; background:#0B0F19; color:#EF4444; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; z-index:9999; font-family: sans-serif;"><h1 style="font-size: 2rem; font-weight: bold;">Herramientas de desarrollo detectadas.</h1><p style="font-size: 1rem; color: #9CA3AF; margin-top: 1rem;">Por favor, cierra las herramientas para continuar usando la aplicación.</p></div>';
                devtoolsOpen = true;
            }
        }
    }

    // Ejecutar la detección en un intervalo para una vigilancia constante.
    setInterval(detectDevTools, 750);

})();