import { postIniciarOrden } from '../Fetch/postIniciarOrden.js'
import enviarMensaje from './enviarMensajeTecnico.js'
import nombreEmpresa from '../Utils/nombreEmpresa.js'
import logger from '../Utils/historico.js'
import tomarDatosReclamo from './tomarDatosReclamo.js'

let respuestaOrden
//GENERA EL RECLAMO GUARDANDO LOS DATOS EN LA BD Y ENVIANDO UN MENSAJE A LOS TECNICOS UTILIZADO EN flowEquipo
async function generarReclamo(numero, convGPT) {
    const data = tomarDatosReclamo(convGPT) //obtiene los data:
    /*{
        'Mo': 'Ascensor, Montavehículo, SAR con problemas',
        'Di': 'Jujuy 8',
        Ed: 'EDIFICIO NARITA IV',
        Eq: 'Ascensor'
    }*/
    // carga el reclamo en la bd
    try {
        const nomEmp = await nombreEmpresa()
        console.log(data, 'aca el mensaje con la direccion en generarReclamo')
        const reclamo = {
                nrollamada: numero,
                mensaje: data['Mo'] || 'No se pudo tomar el mensaje',
                empresa: nomEmp,
                accion: '1',
                lugar: '0'
            }
                            
        respuestaOrden = await postIniciarOrden(reclamo)//devuelve un array con los numeros de los tecnicos
        await enviarMensaje(respuestaOrden, `Entro un reclamo. Motivo: "${data['Mo']}". Desde este numero: "${numero}". En la direccion: "${data['Di']}", del edificio:"${data['Ed']}"`, '')
        
        return data
    } catch (error) {
        logger.error('Error en generarReclamo:', error)
        throw error
    }
}

const getNrosTecnicos = () => {
    return respuestaOrden
}

export { generarReclamo, getNrosTecnicos };