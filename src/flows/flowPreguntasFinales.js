import { addKeyword, EVENTS } from '@builderbot/bot'
import flowFin from './flowFin.js'
import end from '../funciones/end.js'

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
            console.log('respuestas', respuestas)
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
            console.log('respuestas', respuestas)
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
            console.log('respuestas', respuestas)
        }
    )
    .addAction(
        {capture: true},
        async (ctx, { flowDynamic, endFlow }) => {
            respuestas.push(ctx.body)
            await flowDynamic([
                {
                    body: `Utilizamos este numero de telefono para que el tecnico se contacte?
                        'Si'
                        'No'
                    `,
                    delay: 2000,
                }
            ])
            console.log('respuestas', respuestas)
        }
    )
    .addAction(
        {capture: true},
        async (ctx, { flowDynamic, gotoFlow }) => {
            const respuesta = ctx.body.toUpperCase()

            if(respuesta.includes('SI')){
                respuestas.push(ctx.from)
                console.log('respuestas', respuestas)
                await flowDynamic([
                    {
                        body: `Gracias por su tiempo, a la brevedad un tecnico se comunicara con usted.`,
                        delay: 2000,
                    }
                ])
                return gotoFlow(flowFin)
            } else if(respuesta.includes('NO')){
                await flowDynamic([
                    {
                        body: `Me dice el numero de telefono al que quiere que se comuniquen?`,
                        delay: 2000,
                    }
                ])
                console.log(ctx.body, 'ctxBodyy')
            }
        }
    )
    .addAction(
        {capture: true},
        async (ctx, { flowDynamic, gotoFlow, endFlow }) => {
            respuestas.push(ctx.body)
            await flowDynamic([
                {
                    body: `Gracias por su tiempo, a la brevedad un tecnico se comunicara con usted.`,
                    delay: 2000,
                }
            ])
            console.log('respuestas', respuestas)
            end(endFlow, ctx.from)//finaliza la conversacion 
            return gotoFlow(flowFin) 
        }
    )

export default flowPreguntasFinales;  