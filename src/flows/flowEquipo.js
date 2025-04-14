import { addKeyword, EVENTS } from "@builderbot/bot";
import end from "../funciones/end.js";
import { getEquipos } from "./flowInicio.js";
import flowFin from "./flowFin.js";
import { getNroOrden, getUrl } from '../Fetch/postIniciarOrden.js'
import flowPreguntasFinales from "./flowPreguntasFinales.js";
import logger from "../Utils/historico.js";
import nombreEmpresa from "../Utils/nombreEmpresa.js";

const flowEquipo = addKeyword(EVENTS.ACTION)
    .addAction(
        null,
        async (ctx, { flowDynamic, gotoFlow, endFlow }) => {
            let equipos = await getEquipos()
            const nroOrden = await getNroOrden()
            const url = await getUrl()
            const nomEmp = await nombreEmpresa()

            console.log('equipos en flow equipo', equipos)
            /* 
            [
                { equiposDB: [ 'ASCENSOR', 'ASCENSOR', 'SAR' ] },
                { equipoR: 'MONTAVEHÍCULO' }
            ]
            */
            try {
                if(equipos[0].equiposDB.includes(equipos[1].equipoR)){
                    await flowDynamic([
                        {
                            body: `*Su reclamo ha sido cargado con exito*👌, el numero de orden es: 👉*${nroOrden}*, mientras espera la respuesta de un tecnico. Puede seguir el estado de su reclamo en el siguiente link: 👉*${url}*.`,
                            delay: 2000,
                        }
                    ])
                    return gotoFlow(flowPreguntasFinales)
                }else{
                    const equiposDisponibles = equipos[0].equiposDB.join(', ')
                    await flowDynamic([
                        /*{
                            body: `*Su reclamo ha sido cargado con exito*👌, el numero de orden es: 👉*${nroOrden}*, mientras espera la respuesta de un tecnico. Puede seguir el estado de su reclamo en el siguiente link: 👉*${url}*.`,
                            delay: 2000,
                        }*/
                        //igualo las opciones, peron el en else deberia tirar un mensaje como el comentado
                        {
                            body: `Nuestra empresa ${nomEmp} no trabaja con el equipo: '${equipos[1].equipoR}' en este edificio, debe comunicarse con la empresa correspondiente, en caso de mas ayuda comunicarse a nuestro servicio de atencion al cliente: 0800 888 4990. El numero de orden generado es ${nroOrden}. Los equipos que tenemos disponibles en este edificio son: ${equiposDisponibles}.`,
                            delay: 2000,
                        }
                    ])
                    return gotoFlow(flowPreguntasFinales)
                }
            } catch (error) {
                logger.log('error en flowEquipo', error)
            }
            
            end(endFlow, ctx.from)//finaliza la conversacion
    })
    
 

export default flowEquipo