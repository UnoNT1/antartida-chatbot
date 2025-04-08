import { finalizarConversacion } from '../openai/historial.js'
//FINALIZA LA CONVERSACION DESPUES DE UN TIEMPÓ DE 10 MINUTOS SIN RESPUESTA
let timeoutId;

function end(endFlow, numero) {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(async () => {
        console.log('Conversación finalizada');
        await finalizarConversacion(numero);
        return endFlow();
    }, 600000);  // 10 minutos en milisegundos
}

export default end;