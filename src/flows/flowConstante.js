import { getOrdenes, guardarOrdenes } from "../funciones/guardarOrdenes.js";
import enviarMsjAUsuario from "../funciones/enviarMsjAUsuario.js";

const flowConstante = async () => {
    setInterval(async () => {
        try {  
            const ordenes = await guardarOrdenes()
            
            //console.log(ordenes, ' ordenes de mysql ')
            enviarMsjAUsuario(ordenes)
        } catch (err) {
            console.error('Error al actualizar ordenes en flow constante: ', err)
        }
    }, 30000)
}

export default flowConstante