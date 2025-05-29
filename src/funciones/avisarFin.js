import { getEnviado, setEnviado } from "../flows/flowInicio.js";
import enviarMensaje from "./enviarMensajeTecnico.js";

const timeouts = {}; // Guarda los timeouts por número

function avisarFin(numero) {
    
    // Si ya hay un timeout para este número, lo limpiamos
    if (timeouts[numero]) {
        clearTimeout(timeouts[numero]);
    }
    console.log(`Timeouts antes de crear uno nuevo: ${JSON.stringify(timeouts)}`);
    // Creamos un nuevo timeout y lo guardamos
    timeouts[numero] = setTimeout(async () => {
        let enviado = getEnviado();
        if (enviado) {
            return;
        }
        await enviarMensaje([], `Si no hay respuesta, esta conversacion finalizara dentro de 2 minutos.`, numero);
        console.log(`Enviando mensaje de aviso de finalización a ${numero} 22222222`, enviado);
        setEnviado(true);
        delete timeouts[numero]; // Limpia el timeout guardado
    }, 480000); // 8 minutos en milisegundos
}

export default avisarFin;