import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import { guardarContexto, mensajeChatGPT } from '../openai/historial.js';
import nombreEmpresa from '../Utils/nombreEmpresa.js';
import getPrompt from '../Utils/getPrompt.js';
import { generarReclamo } from './generarReclamo.js';
import flowEquipo from '../flows/flowEquipo.js';
import tomarDatosReclamo from './tomarDatosReclamo.js';
import consultaMySql from '../Utils/consultaMySql.js';
import { setEquipos, getEquipos, setEquiposReclamo } from '../flows/flowInicio.js';
import { setNroOrden } from '../Fetch/postIniciarOrden.js';

//se utiliza en la funcion end()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const archivoContexto = (number) => path.resolve(__dirname, `../openai/contextoGPT${number}.json`);
/*[
  {
    "role": "user",
    "content": "con las puertas cerradas"
  },
  {
    "role": "system",
    "content": "Gracias por la información. Se ha generado el reclamo para enviar a un técnico de inmediato. El técnico se dirigirá al edificio \"EDIFICIO COFICO II\" en \"BEDOYA 320\" para resolver la situación del ascensor en la que te encuentras encerrado/a con las puertas cerradas. ¡Por favor, mantente tranquilo/a y espera la pronta llegada del técnico!"
  },
]*/
//el motivo de la existencia de esta funcion es por que en algunas opotunidades la ia de GTP hace lo que quiere y no confirma el reclamo de la forma en que se le indica en el propmt
let seConfirmo = false;

async function reclamoSinConfirmar(numero, gotoFlow){
    if(!seConfirmo){
        const nombreEmp = await nombreEmpresa()
        const prompt = await getPrompt(nombreEmp);
        const contexto = archivoContexto(numero);
        let conversacion
        // Intenta leer el archivo de contexto
        try {
            conversacion = await fs.readFile(contexto, 'utf8');
            conversacion = JSON.parse(conversacion); // Parsea el contenido JSON

        } catch (error) {
            if (error.code === 'ENOENT') {
                console.warn(`Archivo de contexto no encontrado: ${contexto}`);
                conversacion = null; // Si no existe, establece conversacion como null
            } else {
                throw error; // Lanza otros errores
            }
        }
        if (!conversacion) {
            return false; // Si no hay conversación, retorna false
        }

        conversacion.map(async conv => {
            conv.content = conv.content.toLowerCase()

            let contiene1 = conv.content.includes('confirmo') || conv.content.includes('generado')
            let contiene2 = conv.content.includes('reclamo')
            let contiene3 = conv.content.includes('éxito')
            let contiene4 = conv.content.includes('motivo del reclamo')
            let contiene5 = conv.content.includes('técnico')
            let contiene6 = conv.content.includes('será')
            let contiene7 = conv.content.includes('enviado')

            if(((contiene1 && contiene2) || (contiene2 && contiene3)) || (contiene5 && contiene6 && contiene7) && !contiene4){
                console.log('existe confirmar en mensaje num:', conv)
                
                const forzarConfirmacion = {
                    "role": "user",
                    "content": "YA TE DI TODOS LOS DATOS, Confirmame la orden y al proximo mensaje contestamelo en el siguiente formato en este formato 'Motivo del reclamo: [OPCION ELEGIDA + detalles]. Direccion: [direccion obtenida comparada con la tabla]. Edificio: [nombre del edificio obtenido comparada con la tabla]. Equipo: [equipo sobre el que se genera el reclamo].'"
                }
                //conversacion.push(forzarConfirmacion)
                conversacion = [...conversacion, forzarConfirmacion]
                
                await guardarContexto(conversacion, numero)
                const respuesta = await mensajeChatGPT(forzarConfirmacion.content, prompt, numero);
                console.log('Respuesta de ChatGPT:', respuesta);
                const dataReclamo = tomarDatosReclamo(respuesta) //obtiene los data:
                /*{
                    'Mo': 'Ascensor, Montavehículo, SAR con problemas',
                    'Di': 'Jujuy 8',
                    Ed: 'EDIFICIO NARITA IV',
                    Eq: 'Ascensor'
                }*/
                seConfirmo = true
                
                if(Object.keys(dataReclamo).length === 0){
                    setEquipos(['Direccion incorrecta'])
                    console.log('aca le doy calor direccion incorrecta en reclamosinconfirmar')
                    return gotoFlow(flowEquipo)
                }

                // Agregar la respuesta de ChatGPT al contexto
                conversacion.push({ role: 'system', content: respuesta });
            
                if(nombreEmp === 'Demo'){
                    const direc = dataReclamo.Di.toUpperCase().replace(/\.$/, '').trim();

                    const query = 'SELECT abr_as00, dir_as00, cta_as00, equ_as00, tit_as00, reg_as00 FROM lpb_as00 WHERE dir_as00 = ?'
                    let equipos = await consultaMySql(query, [direc]); 

                    await setEquipos(equipos)
                    await setEquiposReclamo(dataReclamo)
                    let eqEnDByReclamo = await getEquipos()
                    //si el equipo no existe en el edificio no se genera la orden           
                    console.log(eqEnDByReclamo)             
                    if(!eqEnDByReclamo[0].equiposDB.includes(eqEnDByReclamo[1].equipoR)){   
                        setNroOrden('00')
                        return seConfirmo = true 
                    }else{
                        console.log('se genera en el segundo 2222222222222')
                        await generarReclamo(numero, dataReclamo)
                        return seConfirmo = true 
                    }
                }
                //generar reeclamo desde este punto
                await generarReclamo(numero, dataReclamo)
            }
        })
        console.log(seConfirmo, 'se confirmo en en reclamoSinConfirmar')
        return seConfirmo
    }else{
        return seConfirmo
    }
}

export default reclamoSinConfirmar