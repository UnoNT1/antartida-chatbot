import { finalizarConversacion } from '../openai/historial.js'

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