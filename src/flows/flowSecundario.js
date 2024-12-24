import enviarMsjAUsuario from '../funciones/enviarMsjAUsuario.js';
import { getOrdenes } from '../funciones/guardarOrdenes.js'
import postRevisarOrden from '../Fetch/postRevisarOrden.js'
//segundo flujo que se ejecuta constantemente para comprobar si el reclamo: fue tomado por el tecnico, 
const flowSecundario = async () => {
    setInterval(async () => {
        const ordenes = getOrdenes()
        let ordenRevisada

        //este for actualiza las ordenes a su estado actual y revsa las ordenes
        for(const orden of ordenes){
            try {
                if(orden.r00_cl12 === undefined || orden.r00_cl12 === null || orden.r00_cl12 === ''){
                    return
                }    
                ordenRevisada = await postRevisarOrden(orden.reg_cl12, 0)
                if(orden.r00_cl12 !== ordenRevisada[0].r00_cl12){//actualiza el estado en la orden dentro del array de guardar ordenes
                    orden.r00_cl12 = ordenRevisada[0].r00_cl12
                }
            } catch (err) {
                console.error('Error al actualizar ordenes en flow secundario: ', err)
            }
        }

        enviarMsjAUsuario()
    }, 30000)
}

export default flowSecundario    
