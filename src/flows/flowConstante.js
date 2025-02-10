import { guardarOrdenes } from "../funciones/guardarOrdenes.js";
import enviarMsjAUsuario from "../funciones/enviarMsjAUsuario.js";
import tecnicoTomaReclamo from "../funciones/tecnicoTomaReclamo.js";

const flowConstante = async () => {
    setInterval(async () => {
        try {
            const ordenes = await guardarOrdenes()
            //console.log('hay ordenes')
            console.log(ordenes, ' ordenes de mysql ')
            enviarMsjAUsuario(ordenes)
            tecnicoTomaReclamo(ordenes)
        } catch (err) {
            console.error('Error al obtener ordenes en flow constante: ', err)
        }
    }, 30000)
}

export default flowConstante