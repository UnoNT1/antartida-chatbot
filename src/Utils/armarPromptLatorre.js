import getPrompt from "./getPrompt.js";
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import nombreEmpresa from "./nombreEmpresa.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dirListaEd = (nombreEmp) => path.resolve(__dirname, `../openai/listaEdificios${nombreEmp}.txt`)
/*
**Paso 1: Reconocer la opción recibida**
 si contesta 1 --> persona encerrada
   push pregunta "En que equipo estas encerrada/o?"
   push lista de edificios
   push reconocer edificio Punto 4
 si contesta 2 --> problemas con ascensor, montavehiculo o SAR
    push pregunta "Que equipo presenta problemas?"
    push preguntas dependiendo el equipo
    push lista de edificios
    push reconocer edificio Punto 4
 si contesta 3 --> cancelar reclamo
    push no mandar mas mensajes
    push "FIN DEL CHAT"
*/
let vuelta = 0
let opcion = 0
let prompt = ''
let nombreEmp = ''
let direcLista = ''
let timeoutPrompt = null

const get = async () => {
    nombreEmp = await nombreEmpresa()
    direcLista = dirListaEd(nombreEmp)
    prompt = await getPrompt('Plantilla', '')
}
get()

const limpiarPrompt = async () => {
    prompt = await getPrompt('Plantilla', '')
    vuelta = 0
    opcion = 0
    // Si necesitas limpiar otros datos, hazlo aquí
}

// Llama a esta función cada vez que se use armarPrompt
const reiniciarTimeoutPrompt = () => {
    if (timeoutPrompt) clearTimeout(timeoutPrompt)
    timeoutPrompt = setTimeout(limpiarPrompt, 5 * 60 * 1000) // 5 minutos
}

async function armarPrompt(respuesta) {
    reiniciarTimeoutPrompt()

    vuelta === 0 ? prompt += `
    **Presenta la siguiente pregunta paraa obtener el equipo sobre el cual se genera el reclamo**
    ` : prompt += ''

    respuesta = respuesta.toUpperCase()
    console.log('respuesta', respuesta)
    if(respuesta.includes('1') && vuelta === 0) {
        vuelta = 1
        opcion = 1
        prompt +=` 
        Por favor, indícame en qué equipo estás encerrada/o?
            - A. Ascensor
            - B. Montavehículo` 
        
        return prompt;    
    }else if(respuesta.includes('2') && vuelta === 0) {
        vuelta = 1
        opcion = 2
        prompt +=` 
        Que equipo presenta problemas?
            - A --> Ascensor fuera de servicio

            - B --> Montavehículo/Giradiscos fuera de servicio

            - C --> Porton Corredizo/Elevadizo fuera de servicio

            - D --> Barrera Vehicular fuera de servicio
            
            - E --> Otros problemas (Ejemplo: ruido en viaje, no funciona un botón, objetos caídos en pozo, falta de iluminación, no funciona llavero magnético, etc.)IMPORTANTE**al elegir esta opcion, debes reconocer o preguntar por el equipo sobre el cual esta generando el reclamo el usuario(Ascensor, Montavehiculos)
            Luego, procede al Paso 3.1.`
         
        return prompt;   
    } else if(respuesta.includes('3') && vuelta === 0) {
        prompt = 'FIN DEL CHAT'
        opcion = 3
        
        return prompt;
    }

    if(opcion === 2 && vuelta === 1) {
        vuelta = 2
        prompt += `
        **
        IMPORTANTE - 'A' === 'ASCENSOR'
                     'B' === 'MONTAVEHICULO' 
                     'C' === 'Porton Corredizo/Elevadizo'
                     'D' === 'BARRERA VEHICULAR'
                    'E' === 'OTROS PROBLEMAS'
        Habiendo reconocido correctamente el Equipo elegido en el paso anterior y Realizar las siguientes preguntas:
        (al comienzo del mensaje coloque el nombre del equipo elegido)**
        `

        if(respuesta.includes('A') || respuesta.includes('B') || respuesta.includes('1') || respuesta.includes('2')) {
            prompt += `
            **Al aparecer estas preguntas significa que Se eligio el equipo Ascensor o Montavehículo** 
            En qué nivel se encuentra parado el equipo?
            Está con puertas abiertas?
            El display/pantalla posee algún mensaje?
            Hubo baja de tensión o corte de luz reciéntemente?`
            
            return prompt;
        }else if(respuesta.includes('C') || respuesta.includes('3') ) {
            prompt += ` 
            **Al aparecer estas preguntas significa que Se eligio el equipo Porton Corredizo/Elevadizo** 
            Está con puertas abiertas?
            El display/pantalla posee algún mensaje?
            Hubo baja de tensión o corte de luz reciéntemente?
            Hay alguna parte visible que esté dañada, podrias darnos detalles?`
            
            return prompt;
        }else if(respuesta.includes('D') || respuesta.includes('4')) {
            prompt += ` 
            **Al aparecer estas preguntas significa que Se eligio el equipo Barrera Vehicular** 
            Hubo baja de tensión o corte de luz reciéntemente?
            ¿podrias contarnos con el mayor detalle posible el inconveniente?`
            
            return prompt;
        }else{
            prompt += ` 
            **Al aparecer estas preguntas significa que Se eligio Otros problemas, debes preguntar por el equipo relacionado, si el usuario no otorga un equipo debes poner por defecto el equipo 'Ascensor'** 
            Me indicas el Equipo relacionado a este problema?
            Podrias darme mas detalles sobre el problema que estas teniendo?`
            
            return prompt;
        }
    }

    if((opcion === 1 && vuelta === 1) || (opcion === 2 && vuelta === 2)) {
        vuelta === 1 ? vuelta = 2 : vuelta = 3
        let listaEdificios = await fs.promises.readFile(direcLista, 'utf-8')

        prompt += listaEdificios    
        prompt += `
        
        **Siguiente paso: Solicitar dirección o nombre del edificio**
            **Paso 1: Si no se ha proporcionado la dirección o el nombre del edificio, solicita esta información con el siguiente mensaje:
            *"Lamento la situación, pero no te preocupes, lo resolveremos. Para continuar, necesito identificar el edificio. Por favor, indícame la dirección donde se encuentra el edificio o su nombre."*

            **Paso 1.2: Comparar dirección o nombre con la lista**
            Al obtener la direccion debes compararla con la lista direcciones y nombres de edificios proporcionada al final de este prompt. Este dato puede estar escrito con errores, debes corregirlos al compararlos con los proporcionados en la lista y contestar en el momento preguntando por la confirmacion de la direccion.
            Siempre debes confirmar dirección o nombre encontrado**
            Si encuentras una coincidencia, solicita al usuario que confirme con un "sí" o un "no" si la dirección y e
            
            **Paso 1.3: Dirección o nombre erróneo**
            - Si el usuario responde "no", repite el Paso 1.2. con otra direccion que encuentres en la lista de edificios.
            - Si el usuario vuelve responder que no, carga en el parametro 'Direccion' y 'Edificio' la direccion proporcionada por el Usuario.

            **Paso 1.4: Dirección o nombre confirmado**
            --IMPORTANTE-- Este ultimo mensaje es el que va a confirmar el reclamo en la base de datos, SIEMPRE tiene que ser enviado;
            Si el usuario confirma con un "sí", responde con un texto que tenga SOLO EL SIGUIENTE MENSAJE( 
            --IMPORTANTE-- siempre debe tener los datos 'Motivo del reclamo', 'Direccion', 'Edificio' y 'Equipo'):
            '
                Motivo del reclamo: [OPCION ELEGIDA + detalles].
                Direccion: [direccion obtenida comparada con la tabla].
                Edificio: [nombre del edificio obtenido comparada con la tabla].
                Equipo: [equipo sobre el que se genera el reclamo].
            ' No mostrar nada mas que Motivo del reclamo, Direccion, Edificio y Equipo con sus respectivos datos en el mensaje.`
        return prompt;
    }
    return prompt;
}


export default armarPrompt;