import enviarMensaje from "./enviarMensajeTecnico.js";

let enviado = false
function avisarFin(numero){
    if (enviado) {
        return; // Evita enviar múltiples mensajes
    }
    setTimeout(async () => {
        await enviarMensaje([], `esta conversacion finalizara dentro de 2 minutos.`, numero);
        console.log(`Enviando mensaje de aviso de finalización a ${numero}`);
        enviado = true; // Marca como enviado para evitar futuros envíos
    }, 480000); // 8 minutos en milisegundos
}

export default avisarFin;