import { postIniciarOrden } from '../Fetch/postIniciarOrden.js'
import enviarMensaje from './enviarMensajeTecnico.js'
import nombreEmpresa from '../Utils/nombreEmpresa.js'
import logger from '../Utils/historico.js'

let respuestaOrden
//GENERA EL RECLAMO GUARDANDO LOS DATOS EN LA BD Y ENVIANDO UN MENSAJE A LOS TECNICOS UTILIZADO EN flowEquipo
async function generarReclamo(numero, data) {
    // carga el reclamo en la bd
    try {
        const nomEmp = await nombreEmpresa()
        const reclamo = {
                nrollamada: numero,
                mensaje: data['Mo'] || 'No se pudo tomar el mensaje',
                empresa: nomEmp,
                accion: '1',
                lugar: '0'
            }
                            
        respuestaOrden = await postIniciarOrden(reclamo)//devuelve un array con los numeros de los tecnicos

        if(nomEmp === 'Servicar'){
            respuestaOrden = ['03516373741', '03517363635', '03513182079', '03516373511']
        }
        if(nomEmp === 'Incast'){
            respuestaOrden = ['03517551274']
        }
        await enviarMensaje(respuestaOrden, `Entro un reclamo. Motivo: "${data['Mo']}". Desde este numero: "${numero}". En la direccion: "${data['Di']}", del edificio:"${data['Ed']}"`, '')
        
        return true
    } catch (error) {
        logger.error('Error en generarReclamo:', error)

        return false
    }
}

const getNrosTecnicos = () => {
    return respuestaOrden
}

export { generarReclamo, getNrosTecnicos };