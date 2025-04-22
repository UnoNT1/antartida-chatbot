import { addKeyword, EVENTS } from '@builderbot/bot'
import { mensajeChatGPT, finalizarConversacion } from '../openai/historial.js'
import nombreEmpresa from '../Utils/nombreEmpresa.js'
import end from '../funciones/end.js'
import { generarReclamo } from '../funciones/generarReclamo.js'
import consultaMySql from '../Utils/consultaMySql.js'
import flowEquipo from './flowEquipo.js'
import subirNombreEdificio from '../funciones/subirNombreEdificio.js'
import logger from "../Utils/historico.js";
import getPrompt from '../Utils/getPrompt.js'

let reclamo = {}
let equipos = []

const flowInicio = addKeyword(EVENTS.WELCOME)
    .addAction(
        null,
        async (ctx, { flowDynamic, endFlow, gotoFlow }) => {
            const nombreEmp = await nombreEmpresa()
            await flowDynamic([{ body: `Muchas gracias por comunicarse con Ascensores ${nombreEmp}.`, delay: 1000 }])
            //
            console.log('primer action')
            let numero = ctx.from
            let mensaje = ctx.body.toLowerCase()
            const prompt = await getPrompt(nombreEmp);
            const convGPT = await mensajeChatGPT(mensaje, prompt, numero)
            await flowDynamic([{ body: convGPT }])
            end(gotoFlow, endFlow, numero)//finaliza la conversacion
    })
    .addAction(
        { capture: true },
        async (ctx, { flowDynamic, fallBack, gotoFlow, endFlow }) => {
            let numero = ctx.from
            let mensaje = ctx.body.toLowerCase()
            const nombreEmp = await nombreEmpresa()
            //
        console.log('segundo action')
            const prompt = await getPrompt(nombreEmp);
            const convGPT = await mensajeChatGPT(mensaje, prompt, numero)  
            await flowDynamic([{ body: convGPT }])

            //Genera el reclamo y toma los datos del reclamo
            //variables para comprobar si la I.A. confirma el reclamo
            const motivo = convGPT.includes('Motivo del reclamo') 
            const direccion = convGPT.includes('Dirección') || convGPT.includes('Direccion')
            const edificio = convGPT.includes('Edificio') || convGPT.includes('edificio') 
            const equipo = convGPT.includes('Equipo')
            if (motivo && direccion && edificio && equipo) {
                //generar reclamo aca
                reclamo = await generarReclamo(numero, convGPT)
                //
                //
                await finalizarConversacion(numero);
                console.log(reclamo, 'recmlamoooo')
               const direc = reclamo.Di.toUpperCase().replace(/\.$/, '').trim(); //elimina el punto final y saca espacios

               try {
                    const query = 'SELECT abr_as00, dir_as00, cta_as00, equ_as00, tit_as00, reg_as00 FROM lpb_as00 WHERE dir_as00 = ?'
                    equipos = await consultaMySql(query, [direc]);
                    await subirNombreEdificio(direc)

                    if(reclamo.Mo.includes('encerrado') || reclamo.Mo.includes('encerrada')){

                        if(reclamo.Eq.toUpperCase().includes('ASC') || reclamo.Eq.toUpperCase().includes('MONTA')){
                            await flowDynamic([
                                {
                                    body: `✅ El ${reclamo.Eq.replace(/\.$/, '')} es un lugar seguro y con suficiente ventilación. 🚫 No intentes salir por tus propios medios ni tampoco deben intentar ayudarte desde afuera. 🙏 Aguarda por favor la llegada del técnico.`,
                                    delay: 2000,
                                }
                            ])
                        }
                    }
                    return gotoFlow(flowEquipo)
                } catch (error) {
                    logger.error('Error en la consulta MySQL en flowInicio.js:', error);
                    return gotoFlow(flowEquipo)
                }
            }
            end(gotoFlow, endFlow, numero)//finaliza la conversacion
            fallBack('')
        }
    )

 
function getEquipos(){
    equipos = equipos.map(obj => obj['abr_as00']);

    return [
        {
            equiposDB: equipos, 
        },
        {
            equipoR: reclamo.Eq.toUpperCase().replace(/\.$/, '')
        }    
    ]
}     

export { flowInicio, getEquipos };