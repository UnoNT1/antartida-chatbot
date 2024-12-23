import { fechaActual } from "../Utils/fechaHoraActual.js"

const msjRecibidos = []
//valida el mensaje para comprobarlo dentro del debounce
const validarMensaje = (numero, mensaje) => {

    let msjNuevo = {
        mensaje: mensaje,
        fechaActual: fechaActual()
    }
    
    if(!msjRecibidos[numero]){
        msjRecibidos[numero] = msjNuevo
    }else{
        msjRecibidos[numero].mensaje = msjRecibidos[numero].mensaje.concat(`, ${msjNuevo.mensaje}`)
    }
    
    console.log(msjRecibidos, 'msjR')
    return msjRecibidos
}


export default validarMensaje