import { getNroOrden, setNroOrden } from '../Fetch/postIniciarOrden.js';
import flowEquipo from '../flows/flowEquipo.js';
import { setConfirmoFlow } from '../flows/flowInicio.js';
import { finalizarConversacion } from '../openai/historial.js'
import avisarFin from './avisarFin.js';
import enviarMensaje from './enviarMensajeTecnico.js';
import reclamoSinConfirmar from './reclamoSinConfirmar.js';

let timeoutId
async function end(endFlow, numero, gotoFlow, avisar = true) {
    try {
        // Limpia el timeout anterior si existe
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        let reclamo = await reclamoSinConfirmar(numero, gotoFlow);//aca se comprueba si el reclamo fue confirmado o no, si no fue confirmado se envia un mensaje a la IA para que lo confirme
        let nroOrden = await getNroOrden()
        if (nroOrden && gotoFlow !== '') {
            return gotoFlow(flowEquipo)
        }

//ENVIAR AVISO DE QUE LA CONVERSACION VA A FINALIZAR
        avisarFin(numero, avisar)
        // Configura un nuevo timeout si el reclamo no fue confirmado
        timeoutId = reclamo !== true ? setTimeout(async () => {

            setConfirmoFlow(false)//cambia el valor de la variable que maneja el comienzo de la conversacion
            setNroOrden(null)//setea el numero de orden en null para que no se repita el mismo numero de orden en la proxima conversacion

            await enviarMensaje([], `Conversacion Finalizada`, numero);
            await finalizarConversacion(numero);
            return await endFlow();
        }, 600000) : timeoutId; // 10 minutos en milisegundos
    } catch (error) {
        console.error('Error en la función end:', error);
    }
}

export default end;