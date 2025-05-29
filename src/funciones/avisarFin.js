import enviarMensaje from "./enviarMensajeTecnico.js";


function avisarFin(numero){

    setTimeout(async () => {
        await enviarMensaje([], `esta conversacion finalizara dentro de 2 minutos.`, numero);
        console.log(`Enviando mensaje de aviso de finalización a ${numero}`);
    }, 480000); // 8 minutos en milisegundos
}

export default avisarFin;