import postRevisarOrden from '../Fetch/postRevisarOrden.js';
import enviarMensaje from './enviarMensajeTecnico.js';
import { getOrdenes } from './guardarOrdenes.js';

async function enviarMsjAUsuario(){
    //recibe el numero de orden y comienza a ejecutar la funcion
    const ordenes = getOrdenes()//[ { reg_cl12: 37213, r00_cl12: 0, tre_cl12: '5493513898408' } ]

    for(const orden of ordenes) {
        if(orden.r00_cl12 === 0){
            return
        }else if(orden.r00_cl12 === 1){

            const ordenRevisada = await postRevisarOrden(orden.reg_cl12, orden.r00_cl12)

            console.log(ordenRevisada, '----orden a estado 2----',  orden.r00_cl12)
            if(ordenRevisada.status === 'success'){
                enviarMensaje([], 'Un Tecnico a tomado tu reclamo', orden.tre_cl12)
            }
        }else if(orden.r00_cl12 === 3){

            const ordenRevisada = await postRevisarOrden(orden.reg_cl12, orden.r00_cl12)
            
            console.log(ordenRevisada, '-----orden a estado 3----',  orden.r00_cl12)
            if(ordenRevisada.status === 'success'){
                enviarMensaje([], 'El Tecnico a solucionado tu reclamo', orden.tre_cl12)
            }
        }
    }
}


export default enviarMsjAUsuario    