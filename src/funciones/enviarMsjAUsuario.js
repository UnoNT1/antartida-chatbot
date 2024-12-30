import postRevisarOrden from '../Fetch/postRevisarOrden.js';
import enviarMensaje from './enviarMensajeTecnico.js';

async function enviarMsjAUsuario(ordenes){
    //recibe el numero de orden y comienza a ejecutar la funcion
    ordenes.map(async (orden) => {
        if(orden.r00_cl12 === 0){
            return
        }else if(orden.r00_cl12 === 1){

            const ordenRevisada = await postRevisarOrden(orden.reg_cl12, orden.r00_cl12)
            
            console.log('----orden a estado 2----', orden.r00_cl12, '--num Orden: ',  orden.reg_cl12, '/n')
            if(ordenRevisada.status === 'success'){
                enviarMensaje([], 'Un Tecnico a tomado tu reclamo', orden.tre_cl12)
            }
        }else if(orden.r00_cl12 === 3){

            const ordenRevisada = await postRevisarOrden(orden.reg_cl12, orden.r00_cl12, '--num Orden: ',  orden.reg_cl12)
            
            console.log(ordenRevisada, '-----orden a estado 3----',  orden.r00_cl12)
            if(ordenRevisada.status === 'success'){
                enviarMensaje([], 'El Tecnico a solucionado tu reclamo', orden.tre_cl12)
            }
        }
    })
}


export default enviarMsjAUsuario    