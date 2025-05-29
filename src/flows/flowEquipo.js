import { addKeyword, EVENTS } from "@builderbot/bot";
import end from "../funciones/end.js";
import { getEquipos, setConfirmoFlow } from "./flowInicio.js";
import flowFin from "./flowFin.js";
import { getNroOrden, getUrl } from '../Fetch/postIniciarOrden.js'
import flowPreguntasFinales from "./flowPreguntasFinales.js";
import logger from "../Utils/historico.js";
import nombreEmpresa from "../Utils/nombreEmpresa.js";

const flowEquipo = addKeyword(EVENTS.ACTION)
    .addAction(
        null,
        async (ctx, { flowDynamic, gotoFlow, endFlow }) => {
            const nroOrden = await getNroOrden()
            const url = await getUrl()
            const nomEmp = await nombreEmpresa()
            let equipos = await getEquipos(nomEmp)
            const equipoR = equipos[1].equipoR.includes('SAR') ? 'SAR' : equipos[1].equipoR
            const equiposDB = equipos[0].equiposDB
            let numAtencionCl

            if(nomEmp === 'Latorre'){
                numAtencionCl = '3585603332'
            }else if(nomEmp === 'Servicar'){
                numAtencionCl = '3517363635'
            }else if(nomEmp === 'Incast'){
                numAtencionCl = '0800 888 4990'
            } else if(nomEmp === 'Antartida'){
                numAtencionCl = '3516674325'
            } else{
                numAtencionCl = '0800 888 4990'
            }

            console.log('flow equipo', equiposDB[0])
            /* 
            [
                { equiposDB: [ 'ASCENSOR', 'ASCENSOR', 'SAR' ] },
                { equipoR: 'MONTAVEHÍCULO' }
            ]
            */
            if(equiposDB[0] === 'Direccion incorrecta' && nomEmp === 'Incast'){//Solo para incast
                await flowDynamic([
                    {
                        body: `La dirección ingresada no es correcta, por favor verifique la misma y/o comuniquese a este numero: ${numAtencionCl}.`,
                        delay: 2000,
                    }
                ])
                setConfirmoFlow(true)
                
                return end(endFlow, ctx.from, '')
            }else{

                try {
                    if(equiposDB.includes(equipoR) || equiposDB[0] === 'Direccion incorrecta'){///corregir caso de SAR/////////
                        await flowDynamic([
                            {
                                body: `*Su reclamo ha sido cargado con exito*👌, el numero de orden es: 👉*${nroOrden}*. Un tecnico se contactara con Usted.`,
                                delay: 2000,
                            }
                        ])
                        return gotoFlow(flowPreguntasFinales)
                    }else{
                        const equiposDisponibles = [...new Set(equipos[0].equiposDB)].join(', ');//esta variable concatena los diferentes equipos que se encuentrar activos por la empresa en determiado edificio
    
                        await flowDynamic([
                            {
                                body: `Nuestra empresa ${nomEmp} no trabaja con el equipo: '${equipos[1].equipoR}' en este edificio, debe comunicarse con la empresa correspondiente, en caso de mas ayuda comunicarse a nuestro servicio de atencion al cliente: ${numAtencionCl}. Los equipos que tenemos disponibles en este edificio son: ${equiposDisponibles}.`,
                                delay: 2000,
                            }
                        ])
                        setConfirmoFlow(true)

                        if(nomEmp === 'Incast'){//Solo para incast
                            return end(endFlow, ctx.from, '')
                        } else{
                            return gotoFlow(flowPreguntasFinales)
                        }
                    }
                } catch (error) {
                    logger.log('error en flowEquipo', error)
                }
                
            }
            end(endFlow, ctx.from, gotoFlow)//finaliza la conversacion                
    })
    
 

export default flowEquipo