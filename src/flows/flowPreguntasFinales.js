import { addKeyword, EVENTS } from '@builderbot/bot'
import flowFin from './flowFin.js'
import end from '../funciones/end.js'
import enviarMensaje from '../funciones/enviarMensajeTecnico.js'
import { getNrosTecnicos } from '../funciones/generarReclamo.js' 

let respuestas = []

const flowPreguntasFinales = addKeyword(EVENTS.ACTION) 
    .addAction(
        {capture: false},
        async (ctx, { flowDynamic, endFlow }) => {
            console.log('Preguntas finalessssdadasdsa')
            await flowDynamic([
                {
                    body: `Para finalizar, contesteme las siguientes preguntas necesarias para agilizar el actuar del tecnico: `,
                    delay: 2000,
                }
            ])
        }
    )
    .addAction(
        {capture: false},
        async (ctx, { flowDynamic, endFlow }) => {
            await flowDynamic([
                {
                    body: `Me dice su Apellido y Nombre?`,
                    delay: 2000,
                }
            ])
            end(endFlow, ctx.from)//finaliza la conversacion 
        }
    )
    .addAction(
        {capture: true},
        async (ctx, { flowDynamic, endFlow }) => {
            respuestas.push(ctx.body)
            await flowDynamic([
                {
                    body: `Hay luz en el edificio?`,
                    delay: 2000,
                }
            ])
            end(endFlow, ctx.from)//finaliza la conversacion 
        }
    )
    .addAction(
        {capture: true},
        async (ctx, { flowDynamic, endFlow }) => {
            respuestas.push(ctx.body)
            await flowDynamic([
                {
                    body: `Se encuentra alguien en el edificio que pueda permitir el ingreso al tecnico?`,
                    delay: 2000,
                }
            ])
            end(endFlow, ctx.from)//finaliza la conversacion 
        }
    )
    .addAction(
        {capture: true},
        async (ctx, { flowDynamic, endFlow }) => {
            respuestas.push(ctx.body)
            await flowDynamic([
                {
                    body: `Agregue mas detalles si asi lo desea, de lo contrario escriba "NADA"`,
                    delay: 2000,
                }
            ])
            end(endFlow, ctx.from)//finaliza la conversacion 
        }
    )
    .addAction(
        {capture: true},
        async (ctx, { flowDynamic, endFlow }) => {
            respuestas.push(ctx.body)
            await flowDynamic([
                {
                    body: `Desea que el tecnico se comunique a este numero? Responda "SI" o "NO"`,
                    delay: 2000,
                }
            ])
            end(endFlow, ctx.from)//finaliza la conversacion 
        }
    )
    .addAction(
        {capture: true},
        async (ctx, { flowDynamic, gotoFlow,endFlow }) => {
            const respuesta = ctx.body.toUpperCase()
            const numeroTecnicos = await getNrosTecnicos()

            if(respuesta.includes('SI')){
                respuestas.push(ctx.from)
                await flowDynamic([
                    {
                        body: `Gracias por su tiempo, a la brevedad un tecnico se comunicara con usted.`,
                        delay: 2000,
                    }
                ])
                //await enviarMensaje(numeroTecnicos, `El cliente ${respuestas[0]} contesto las siguientes preguntas: LUZ EN EL EDIFICIO: ${respuestas[1]}, PERMITIR INGRESO AL TECNICO: ${respuestas[2]}, TELEFONO DE CONTACTO: ${respuestas[3]}`, '')
                return gotoFlow(flowFin)
            } else if(respuesta.includes('NO')){
                await flowDynamic([
                    {
                        body: `Me dice el numero de telefono al que quiere que se comuniquen?`,
                        delay: 2000,
                    }
                ])
            }
            end(endFlow, ctx.from)//finaliza la conversacion 
        }
    )
    .addAction(
        {capture: true},
        async (ctx, { flowDynamic, gotoFlow, endFlow }) => {
            const numeroTecnicos = await getNrosTecnicos()

            respuestas.push(ctx.body)

            await flowDynamic([
                {
                    body: `Gracias por su tiempo, a la brevedad un tecnico se comunicara con usted.`,
                    delay: 2000,
                }
            ])
            console.log('respuestas', respuestas)
            end(endFlow, ctx.from)//finaliza la conversacion 
            //await enviarMensaje(numeroTecnicos, `El usuario ${respuestas[0]} contesto las siguientes preguntas: LUZ EN EL EDIFICIO: ${respuestas[1]}, PERMITIR INGRESO AL TECNICO: ${respuestas[2]}, MAS DETALLES: ${respuestas[3]}, MAS DETALLES: ${respuestas[4]} TELEFONO DE CONTACTO: ${respuestas[5]}`, '')
            return gotoFlow(flowFin) 
        }
    )

export default flowPreguntasFinales;  