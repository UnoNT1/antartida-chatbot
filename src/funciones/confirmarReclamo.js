import { finalizarConversacion, mensajeChatGPT } from "../openai/historial.js";
import nombreEmpresa from "../Utils/nombreEmpresa.js";

let conversacion = ''

async function confirmarReclamo(msjUser ,msjIA) {
    let numAl = Math.floor(Math.random() * 1000) //numero aleatorio para el nombre del archivo de la conversacion
    let chat = `user: ${msjUser}\nIA: ${msjIA}`
    conversacion += chat + '\n'
    
    const respuesta = await mensajeChatGPT('', `En base a la conversación, ¿puedes completar estos 4 datos? 
- Motivo del reclamo: [opción elegida + detalles].
- Dirección: [dirección obtenida y validada comparando con la tabla].
- Edificio: [nombre del edificio obtenido y validado comparando con la tabla].
- Equipo: [equipo sobre el que se genera el reclamo].

Instrucciones importantes:
- No muestres ni completes los datos hasta que tengas toda la información necesaria.
    - La dirección o el nombre del edificio deben haber sido confirmados explícitamente por el usuario como correctos.
    - Si falta algún dato, o la dirección o el edificio no han sido confirmados por el usuario, responde únicamente con "No".
    - Solo muestra los datos cuando todos estén completos y validados por el usuario.
    -El usuario confirma la direccion o nombre del edificio al responder que 'si' a una pregunta como por ejemplo de esta forma: '¿Podés confirmar si el edificio es "EDIFICIO DE EJEMPLO 123" y la dirección es "CALLE DE EJEMPLO 123"? Por favor, responde "sí" o "no".'

Analiza cuidadosamente la conversación antes de responder. ` + conversacion , numAl)
    //console.log('confirmarReclamo', respuesta)

    finalizarConversacion(numAl)
    return respuesta
}

export default confirmarReclamo;