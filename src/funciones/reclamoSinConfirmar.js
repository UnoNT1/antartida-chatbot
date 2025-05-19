import { guardarContexto, mensajeChatGPT, finalizarConversacion } from '../openai/historial.js';
import getPrompt from '../Utils/getPrompt.js';
import nombreEmpresa from '../Utils/nombreEmpresa.js';
import { generarReclamo } from './generarReclamo.js';
import flowEquipo from '../flows/flowEquipo.js';
import tomarDatosReclamo from './tomarDatosReclamo.js';
import consultaMySql from '../Utils/consultaMySql.js';
import { setEquipos, getEquipos, setEquiposReclamo, setVerificar } from '../flows/flowInicio.js';
import { setNroOrden } from '../Fetch/postIniciarOrden.js';
import copiaConv from './convReclamoSinConfirmar.js';

//se utiliza en la funcion end()

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
        let conversacion = await copiaConv(numero)
        setVerificar(numero)
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
                console.log('reclamo sin confirmar', conv)
                
                const forzarConfirmacion = {
                    "role": "user",
                    "content": `te confirmo la direccion es la que te dije en el mensaje anterior, YA TE DI TODOS LOS DATOS y  Confirmame la orden y para eso al proximo mensaje contestamelo en el siguiente formato con la informacion que hayas podido recolectar 'Motivo del reclamo: [OPCION ELEGIDA + detalles].
                     Direccion: [direccion obtenida comparada con la tabla]. 
                     Edificio: [nombre del edificio obtenido comparada con la tabla].  
                     Equipo: [equipo sobre el que se genera el reclamo].'`
                }
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
                    return gotoFlow(flowEquipo)
                }

                // Agregar la respuesta de ChatGPT al contexto
                conversacion.push({ role: 'system', content: respuesta });
            
                console.log(dataReclamo)
                const direc = dataReclamo.Di.toUpperCase().replace(/\.$/, '').trim();
                
                const query = 'SELECT abr_as00, dir_as00, cta_as00, equ_as00, tit_as00, reg_as00 FROM lpb_as00 WHERE dir_as00 = ?'
                let equipos = await consultaMySql(query, [direc]); 
                
                setEquipos(equipos)
                setEquiposReclamo(dataReclamo)
                if(nombreEmp === 'Incast'){
                    let eqEnDByReclamo = getEquipos()
                    //si el equipo no existe en el edificio no se genera la orden           
                    console.log(eqEnDByReclamo)             
                    if(!eqEnDByReclamo[0].equiposDB.includes(eqEnDByReclamo[1].equipoR)){   
                        setNroOrden('00')
                        await finalizarConversacion(numero)
                        return gotoFlow(flowEquipo) 
                    }else{
                        await generarReclamo(numero, dataReclamo)
                        await finalizarConversacion(numero)
                        return gotoFlow(flowEquipo)
                    }
                }
                //generar reeclamo desde este punto
                seConfirmo = true
                await generarReclamo(numero, dataReclamo)
                await finalizarConversacion(numero)
                return gotoFlow(flowEquipo)
            }
        })
        console.log(seConfirmo, 'se confirmo en en reclamoSinConfirmar')
    }else{
        return seConfirmo
    }
}

export default reclamoSinConfirmar