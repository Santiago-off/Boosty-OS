/**
 * Boosty OS Security Module
 * Protecciones contra inspección, depuración y bots.
 */

// 1. Deshabilitar Click Derecho (Context Menu)
document.addEventListener('contextmenu', (e) => e.preventDefault());

// 2. Deshabilitar Atajos de Teclado de Desarrollo
document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') {
        e.preventDefault();
        return false;
    }
    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
    if (e.ctrlKey && e.shiftKey && ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].includes(e.key.toUpperCase())) {
        e.preventDefault();
        return false;
    }
    // Ctrl+U (Ver código fuente)
    if (e.ctrlKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        return false;
    }
});

// 3. Trampa de Depuración (Debugger Trap)
// Esto detiene o ralentiza la ejecución si las DevTools están abiertas y activas
setInterval(() => {
    // La llamada anónima al constructor de debugger dificulta su eliminación estática
    (function(){return false;})['constructor']('debugger')['call']();
}, 1000);

// 4. Limpieza y Bloqueo de Consola
const clearConsole = () => {
    try {
        console.clear();
        console.log('%c⚠️ SEGURIDAD ACTIVADA', 'color: red; font-size: 30px; font-weight: bold; text-shadow: 2px 2px 0px black;');
        console.log('%cEl acceso a la consola está restringido por motivos de seguridad.', 'font-size: 16px; color: #fff;');
    } catch (e) {}
};

// Limpiar inmediatamente y luego periódicamente
clearConsole();
setInterval(clearConsole, 2000);