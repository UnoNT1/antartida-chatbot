import estandarizar from "./accionesNumero.js"
import logger from "../Utils/historico.js";

//envia mensaje a los tecnicos y a los usuarios, nroTecnicos es un array y nroUser un string
const enviarMensaje = async (nroTecnicos, mensaje, nroUser) => {
    try {
        if (nroUser !== '') {
            fetchMensaje(nroUser, mensaje)
        } else {
            nroTecnicos.map(async (num) => {
                num = await estandarizar(num)
                fetchMensaje(num, `${mensaje}`)
                console.log('Telefono: ', num, ' estandarizado')
            })
        }
    } catch (err) {
        logger.error('1º error al intentar enviar mensaje')
    }
}

//hace una solicitud post al proovedor de builderBot que se encarga de enviar los mensajes
async function fetchMensaje(numero, mensaje) {
    try {
        await fetch("http://localhost:3005/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                number: numero,
                message: mensaje,
            }),
        })
            .then((response) => {
                if (!response.ok) throw new Error("3° Error al intentar enviar mensaje");
                return response.text();
            })
            .then((data) => {
                console.log(`Celular: ${numero} - Mensaje: ${mensaje}`, data);
            })
            .catch((error) => {
                logger.error("4° Error  al intentar enviar mensaje: ", error);
            });

    } catch (error) {
        logger.error('5° Error  al intentar enviar mensaje:  ',error)
    }
}

export default enviarMensaje;
