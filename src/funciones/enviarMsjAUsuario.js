import postRevisarOrden from '../Fetch/postRevisarOrden.js';
import enviarMensaje from './enviarMensajeTecnico.js';
import consultaMySql from '../Utils/consultaMySql.js';

//USADA EN FLOW CONSTANTE, VA CONTROLANDO EL ESTADO DE LAS ORDENES Y ENVIANDO MENSAJES A LOS USUARIOS
async function enviarMsjAUsuario(ordenes) {
    //recibe el numero de orden y comienza a ejecutar la funcion
    ordenes.map(async (orden) => {
        if (orden.r00_cl12 === 0) {
            return
        } else if (orden.r00_cl12 === 1) {

            const ordenRevisada = await postRevisarOrden(orden.reg_cl12, orden.r00_cl12)

            console.log('----orden a estado 2----', orden.r00_cl12, '--num Orden: ', orden.reg_cl12, '/n')
            if (ordenRevisada.status === 'success') {
                //busca el nombre del tecnico que tomo el pedido y la demora
                const queryTecnico = 'SELECT usu_cl12, dem_cl12 FROM lpb_cl12 WHERE reg_cl12 = ?'
                const valueNroRegistro = [orden.reg_cl12]
                const tecnicos = await consultaMySql(queryTecnico, valueNroRegistro)
                const tecnico = tecnicos[0].usu_cl12.split(' ') ? tecnicos[0].usu_cl12.split(' ') : tecnicos[0].usu_cl12
                //busca la ficha del tecnico para crear la url
                const queryIdTecnico = 'SELECT reg_ag00 from lpb_ag00 WHERE usu_ag00 = ?'
                const valueNombreTecnico = [tecnico[0]]
                const idTecnico = await consultaMySql(queryIdTecnico, valueNombreTecnico)

                const url = `https://www.unont.com.ar/yavoy/verTecnico.php?id=${idTecnico[0].reg_ag00}`

                enviarMensaje([], `Un Tecnico a tomado tu reclamo, su demora es de ${tecnicos[0].dem_cl12}. Aca podes ver la ficha del tecnico: ${url}`, orden.tre_cl12)
            }
        } else if (orden.r00_cl12 === 3) {

            const ordenRevisada = await postRevisarOrden(orden.reg_cl12, orden.r00_cl12, '--num Orden: ', orden.reg_cl12)

            console.log(ordenRevisada, '-----orden a estado 3----', orden.r00_cl12)
            if (ordenRevisada.status === 'success') {
                enviarMensaje([], 'El Tecnico a solucionado tu reclamo', orden.tre_cl12)
            }
        }
    })
}


export default enviarMsjAUsuario    