import { addKeyword, EVENTS } from "@builderbot/bot";
import end from "../funciones/end.js";
import { getEquipos } from "./flowInicio.js";
import flowFin from "./flowFin.js";
import flowPreguntasFinales from "./flowPreguntasFinales.js";


const flowEquipo = addKeyword(EVENTS.ACTION)
    .addAction(
        null,
        async (ctx, { flowDynamic, gotoFlow, endFlow }) => {
            let equipos = await getEquipos()

            console.log('equipos en flow equipo', equipos)
            /* 
            [
                { equiposDB: [ 'ASCENSOR', 'ASCENSOR', 'SAR' ] },
                { equipoR: 'MONTAVEHÍCULO' }
            ]
            */
           
            if(equipos[0].equiposDB.includes(equipos[1].equipoR)){
                await flowDynamic([
                    {
                        body: `Su reclamo ha sido cargado con exito, el numero de orden es: 123456, mientras espera la respuesta de un tecnico, le pido me responda las siguientes preguntas: `,
                        delay: 2000,
                    }
                ])
                console.log('ifff equipooo')
                return gotoFlow(flowPreguntasFinales)
            }else{
                await flowDynamic([
                    {
                        body: `El equipo ${equipos[1].equipoR} no existe en nuestra base de datos, debe comunicarse con la empresa correspondiente, en caso de mas ayuda comunicarse a nuestro servicio de atencion al cliente: 0800 888 4990`,
                        delay: 2000,
                    }
                ])
                return gotoFlow(flowPreguntasFinales)
            }
            
            end(endFlow, ctx.from)//finaliza la conversacion
    })
    
 

export default flowEquipo