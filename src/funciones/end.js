import { finalizarConversacion } from '../openai/historial.js'
import reclamoSinConfirmar from './reclamoSinConfirmar.js';

let timeoutId
function end(gotoFlow, endFlow, numero) {
    try {
        // Limpia el timeout anterior si existe
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        let reclamo = reclamoSinConfirmar(numero, gotoFlow);
        // Configura un nuevo timeout si el reclamo no fue confirmado
        timeoutId = reclamo !== true ? setTimeout(async () => {
            console.log('Conversación finalizada por inactividad.');
            await finalizarConversacion(numero);
            return await endFlow();
        }, 600000) : timeoutId; // 10 minutos en milisegundos
    } catch (error) {
        console.error('Error en la función end:', error);
    }
}

export default end;