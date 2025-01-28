import enviarMensaje from './enviarMensajeTecnico.js';
import consultaMySql from '../Utils/consultaMySql.js';
import formatearFecha from './farmatearFecha.js';

let enviado = false
async function tecnicoTomaReclamo(ordenes){

    ordenes.map(async (orden) => {
        if(orden.r00_cl12 === 2){
            try {
                const direccion = orden.dom_cl12
                const queryServices = 'SELECT fec_cl12, ser_cl12 FROM lpb_cl12 WHERE dom_cl12 = ? ORDER BY fec_cl12 DESC LIMIT 10'
                const services = await consultaMySql(queryServices, [direccion])
                
                //busca el nombre del tecnico que tomo el pedido
                const queryTecnico = 'SELECT usu_cl12, fec_cl12 FROM lpb_cl12 WHERE reg_cl12 = ?'
                const valueNroRegistro = [orden.reg_cl12]
                const tecnicos = await consultaMySql(queryTecnico, valueNroRegistro)
                const tecnico = tecnicos[0].usu_cl12.split(' ') ? tecnicos[0].usu_cl12.split(' ') : tecnicos[0].usu_cl12
                //busca la ficha del tecnico para crear la url
                const queryIdTecnico = 'SELECT tel_ag00 from lpb_ag00 WHERE usu_ag00 = ?'
                const valueNombreTecnico = [tecnico[0]]
                const telTecnico = await consultaMySql(queryIdTecnico, valueNombreTecnico)
                
                let mensaje = `Este es el historial tecnico del ascensor: `
                
                const fecha = formatearFecha(tecnicos[0].fec_cl12)
                services.map(ser => {
                    mensaje += `
                    ->Tecnico: ${tecnico}, 
                    fecha: ${fecha}, 
                    servicio: ${ser.ser_cl12}`
                })
                
                if(telTecnico === ''){
                    console.error('El tecnico no ingreso su numero de telefono')
                    return
                }
                console.log(telTecnico, enviado)
                if(enviado === false){
                    enviarMensaje([telTecnico[0].tel_ag00], mensaje, '')
                    enviado = true
                }
            } catch (err) {
                console.error(err, 'error al enviar ultimos services al tecnico')
            }
        }
    })
}

export default tecnicoTomaReclamo;