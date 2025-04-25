import flowEquipo from '../flows/flowEquipo.js';
import { finalizarConversacion } from '../openai/historial.js'
import reclamoSinConfirmar from './reclamoSinConfirmar.js';

let timeoutId
async function end(endFlow, numero, gotoFlow) {
    try {
        // Limpia el timeout anterior si existe
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        let reclamo = await reclamoSinConfirmar(numero, gotoFlow);
        console.log(reclamo, 'en end flow true or false')
        if (reclamo === true) return gotoFlow(flowEquipo)
        // Configura un nuevo timeout si el reclamo no fue confirmado
        timeoutId = reclamo !== true ? setTimeout(async () => {
            console.log('Conversación finalizada por inactividad.', reclamo, timeoutId);
            await finalizarConversacion(numero);
            return await endFlow();
        }, 600000) : timeoutId; // 10 minutos en milisegundos
    } catch (error) {
        console.error('Error en la función end:', error);
    }
}

export default end;