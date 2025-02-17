import { postIniciarOrden } from '../Fetch/postIniciarOrden.js'
import enviarMensaje from './enviarMensajeTecnico.js'
import nombreEmpresa from '../Utils/nombreEmpresa.js'

let respuestaOrden

async function generarReclamo(numero, data) {
    // carga el reclamo en la bd
    const nomEmp = await nombreEmpresa()
    console.log(data, 'aca el mensaje con la direccion en generarReclamo')
    const reclamo = {
            nrollamada: numero,
            mensaje: data[0] || 'No se pudo tomar el mensaje',
            empresa: nomEmp,
            accion: '1',
            lugar: '0'
        }
                        
    respuestaOrden = await postIniciarOrden(reclamo)//devuelve un array con los numeros de los tecnicos
    //await enviarMensaje(respuestaOrden, `Entro un reclamo. Motivo: "${data[0]}". Desde este numero: "${numero}". En la direccion: "${data[1]}"`, '')
    return respuestaOrden
}

const getNrosTecnicos = () => {
    return respuestaOrden
}

export { generarReclamo, getNrosTecnicos };