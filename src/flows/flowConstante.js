import { guardarOrdenes } from "../funciones/guardarOrdenes.js";
import enviarMsjAUsuario from "../funciones/enviarMsjAUsuario.js";
import tecnicoTomaReclamo from "../funciones/tecnicoTomaReclamo.js";
import logger from "../Utils/historico.js";

const flowConstante = async () => {
    setInterval(async () => {
        try {
            const ordenes = await guardarOrdenes()
            console.log(ordenes[0], ' ordenes de mysql ')
            enviarMsjAUsuario(ordenes)
            tecnicoTomaReclamo(ordenes)
        } catch (err) {
            logger.error('Error al obtener ordenes en flow constante: ', err)
        }
    }, 30000)
}

export default flowConstante