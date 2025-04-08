import { createWriteStream, truncate, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta absoluta del directorio `src`
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logFilePath = join(__dirname, '..', 'app.log'); // Guardará el log en `src/app.log`
const MAX_LOG_SIZE = 1 * 1024 * 1024; // 5 MB

// Función para verificar el tamaño del archivo y vaciarlo si es necesario
function checkLogFileSize() {
    try {
        const stats = statSync(logFilePath);
        if (stats.size > MAX_LOG_SIZE) {
            console.log('El archivo de logs es demasiado grande. Se vaciará...');
            truncate(logFilePath, 0, (err) => {
                if (err) throw err;
                console.log('El archivo de logs ha sido vaciado.');
            });
        }
    } catch (err) {
        // Si el archivo no existe, no pasa nada
        if (err.code !== 'ENOENT') throw err;
    }
}

// Llamar a la función para verificar el tamaño antes de escribir en el archivo
checkLogFileSize();

// Crear un flujo de escritura para guardar los logs
const logFile = createWriteStream(logFilePath, { flags: 'a' });

// Guardar referencias originales
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
const originalInfo = console.info;

// Función para escribir en el archivo y en la consola
function writeLog(originalFn, type, ...messages) {

    const now = new Date();
    const fecha = now.toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
    const hora = now.toLocaleTimeString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour12: false });

    const logMessage = `[${fecha}] [${hora}] [${type.toUpperCase()}] ${messages.join(' ')}\n`;

    logFile.write(logMessage); // Guardar en el archivo
    originalFn.apply(console, messages); // Mostrar en consola
}
// Sobreescribir los métodos de `console`
console.log = (...args) => writeLog(originalLog, 'log', ...args);
console.error = (...args) => writeLog(originalError, 'error', ...args);
console.warn = (...args) => writeLog(originalWarn, 'warn', ...args);
console.info = (...args) => writeLog(originalInfo, 'info', ...args);

// Exportar los métodos de consola para poder usarlos en otros archivos
export default {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
};