import estandarizar from "./accionesNumero.js"
//envia mensaje a los tecnicos y a los usuarios, nroTecnicos es un array y nroUser un string
const enviarMensaje = async (nroTecnicos, mensaje, nroUser) => {

    try {
        if (nroUser !== '') {
            fetchMensaje(nroUser, mensaje)
        } else {
            nroTecnicos.map(num => {
                num = estandarizar(num)
                fetchMensaje(num, `ingreso un reclamo con el siguiente mensaje: ${mensaje}`)
                console.log('Telefono: ', num, ' estandarizado')
            })
        }
    } catch (err) {
        console.error('1º error al intentar enviar mensaje')
    }
}

//hace una solicitud post al proovedor de builderBot que se encarga de enviar los mensajes
async function fetchMensaje(numero, mensaje) {
    try {
        await fetch("http://localhost:3008/v1/messages", {
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
                console.error("4° Error  al intentar enviar mensaje: ", error);
            });

    } catch (error) {
        console.error(error)
    }
}

export default enviarMensaje;
