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
const get = async () => {
    nombreEmp = await nombreEmpresa()
    direcLista = dirListaEd(nombreEmp)
    prompt = await getPrompt(nombreEmp, '3')
}
get()

async function armarPrompt(respuesta) {
    respuesta = respuesta.toUpperCase()
    console.log('respuesta', respuesta)
    if(respuesta.includes('1') && vuelta === 0) {
        vuelta = 1
        opcion = 1
        prompt +=` 
        Por favor, indícame en qué equipo estás encerrada/o?
            - A. Ascensor
            - B. Montavehículo
            - C. SAR (Sistema de Acceso Restringido)` 
        
        return prompt;    
    }else if(respuesta.includes('2') && vuelta === 0) {
        vuelta = 1
        opcion = 2
        prompt +=` 
        Que equipo presenta problemas?
            - A--> Ascensor fuera de servicio
            - B--> Montavehículo fuera de servicio
            - C--> Giradiscos fuera de servicio
            - D--> Rampa fuera de servicio
            - E--> Sistema de acceso no funciona(SAR)
            - F--> Otros problemas (Ejemplo: ruido en viaje, no funciona un botón, objetos caídos en pozo, falta de iluminación, no funciona llavero magnético, etc.)`
         
        return prompt;   
    } else if(respuesta.includes('3') && vuelta === 0) {
        prompt = 'FIN DEL CHAT'
        opcion = 3
        
        return prompt;
    }

    if(opcion === 2 && vuelta === 1) {
        vuelta = 2
        prompt += `
        **Realizar las siguientes preguntas:**
        `

        if(respuesta.includes('A') || respuesta.includes('B')) {
            prompt += ` 
            En qué nivel se encuentra parado el equipo?
            Está con puertas abiertas?
            El display/pantalla posee algún mensaje?
            Hubo baja de tensión o corte de luz reciéntemente?`
            
            return prompt;
        }else if(respuesta.includes('C') || respuesta.includes('D')) {
            prompt += ` 
            Está con puertas abiertas?
            El display/pantalla posee algún mensaje?
            Hubo baja de tensión o corte de luz reciéntemente?`
            
            return prompt;
        }else if(respuesta.includes('E')) {
            prompt += ` 
            Hubo baja de tensión o corte de luz reciéntemente?
            La puerta actualmente se encuentra abierta?
            Hay alguna parte visible que esté dañada, podrias darnos detalles?
            Es solo su llavero el que falla ó sabes si el llavero de las demás personas también comparten la falla?`
            
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
            Si encuentras una coincidencia, solicita al usuario que confirme con un "sí" o un "no" si la dirección y el nombre del edificio encontrado es correcto.

            **Paso 1.3: Dirección o nombre erróneo**
            - Si el usuario responde "no", repite el Paso 4.2.
            - Si el usuario responde "no" por segunda vez, proporciona este número para que se comunique con un asesor: **0800 888 4990**.

            **Paso 1.4: Dirección o nombre confirmado**
            --IMPORTANTE-- Este ultimo mensaje es el que va a confirmar el reclamo en la base de datos, SIEMPRE tiene que ser enviado;
            Si el usuario confirma con un "sí", responde con un texto que tenga SOLO EL SIGUIENTE MENSAJE( 
            --IMPORTANTE-- siempre debe tener los datos 'Motivo del reclamo', 'Direccion', 'Edificio' y 'Equipo'):
            '
                Motivo del reclamo: [OPCION ELEGIDA + detalles].
                Direccion: [direccion obtenida comparada con la tabla].
                Edificio: [nombre del edificio obtenido comparada con la tabla].
                Equipo: [equipo sobre el que se genera el reclamo].
            ' `
        return prompt;
    }
    return prompt;
}

export default armarPrompt;