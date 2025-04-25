import { addKeyword, EVENTS } from '@builderbot/bot'
import flowFin from './flowFin.js'
import end from '../funciones/end.js'
import enviarMensaje from '../funciones/enviarMensajeTecnico.js'
import { getNrosTecnicos } from '../funciones/generarReclamo.js' 
import { getEquipos } from './flowInicio.js'
import { getNroOrden, getUrl } from '../Fetch/postIniciarOrden.js'
import consultaMySql from '../Utils/consultaMySql.js'
import respuestaTemporal from '../funciones/respuestaTemporal.js'

let respuestas = []
//Este flow guarda la info de las respuestas para enviar un mensaje al tecni al finalizar

const flowPreguntasFinales = addKeyword(EVENTS.ACTION) 
    .addAction(
        {capture: false},
        async (ctx, { flowDynamic }) => {
            console.log(respuestas, 'resp al prinpicio de finales')
            await flowDynamic([
                {
                    body: `Para finalizar, por favor conteste las siguientes preguntas necesarias para agilizar el actuar del tecnico: `,
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
            let mensaje = await respuestaTemporal(ctx.body)

            respuestas.push(mensaje)
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
        ////modificar para caso de persona encerrada en SAR //////
        {capture: true},
        async (ctx, { flowDynamic, endFlow }) => {
            let mensaje = await respuestaTemporal(ctx.body)

            respuestas.push(mensaje)
            await flowDynamic([
                {
                    body: `Se encuentra alguien en el edificio que pueda permitir el ingreso al tecnico? Ten en cuenta que si hay un técnico en la zona y le permiten el ingreso, la atención al problema será más rápido`,
                    delay: 2000,
                }
            ])
            end(endFlow, ctx.from)//finaliza la conversacion 
        }
    )
    .addAction(
        {capture: true},
        async (ctx, { flowDynamic, endFlow }) => {
            const equipoR = await getEquipos()[1].equipoR
            const mensajeATecnico = equipoR.includes('SAR') ? 'No hay alguien en el edificio que pueda otorgar el ingreso al tecnico' : 'LLEVAR LLAVE MAESTRA' ///cambia la info que se le va a mandar al tecnico dependiendo el equipo del reclamo

            if(ctx.body.toUpperCase().includes('NO')){
                let mensaje = await respuestaTemporal(ctx.body)
    
                respuestas.push(mensaje)
            }else{
                let mensaje = await respuestaTemporal(ctx.body)
    
                respuestas.push(mensaje)
            }
            await flowDynamic([
                {
                    body: `Excelente ${respuestas[1]}, puedes poner algún detalle que creas útil sobre el equipo o para mejorar nuestra gestión`,
                    delay: 2000,
                }
            ])
            end(endFlow, ctx.from)//finaliza la conversacion 
        }
    )
    .addAction(
        {capture: true},
        async (ctx, { flowDynamic, endFlow }) => {
            let mensaje = await respuestaTemporal(ctx.body)

            respuestas.push(mensaje)
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

            const url = await getUrl()
            const nroOrden = await getNroOrden()
            const nombre = respuestas[1].replace(/ /g, ', ')

            const query = `UPDATE lpb_cl12 SET are_cl12 = ? WHERE reg_cl12 = ?`
            await consultaMySql(query, [nombre, nroOrden])

            if(respuesta.includes('SI')){
                let mensaje = await respuestaTemporal(ctx.body)
    
                respuestas.push(mensaje)
                await flowDynamic([
                    {
                        body: `Gracias por su tiempo, a la brevedad un tecnico se comunicara con usted, en la siguiente Url podra hacer el seguimiento del reclamo: ${url}.`,
                        delay: 2000,
                    }
                ])
                console.log(respuestas, 'aca el mensaje con la direccion en flowPreguntasFinales')
                //await enviarMensaje(numeroTecnicos, `El cliente ${respuestas[1]} contesto las siguientes preguntas: LUZ EN EL EDIFICIO: ${respuestas[0]}, PERSONA PARA PERMITIR INGRESO AL TECNICO: ${respuestas[2]}, TELEFONO DE CONTACTO: ${respuestas[4]}, MAS DETALLES: ${respuestas[3]}`, '')
                respuestas = []
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
            let mensaje = await respuestaTemporal(ctx.body)

            respuestas.push(mensaje)

            const url = await getUrl()
            const nombre = respuestas[1].replace(/ /g, ', ')
            const nroOrden = await getNroOrden()

            const query = `UPDATE lpb_cl12 SET are_cl12 = ?, tre_cl12 = ? WHERE reg_cl12 = ?`
            console.log(nombre)
            await consultaMySql(query, [nombre, respuestas[4], nroOrden])

            await flowDynamic([
                {
                    body: `Gracias por su tiempo, a la brevedad un tecnico se comunicara con usted, en la siguiente Url podra hacer el seguimiento del reclamo: ${url}.`,
                    delay: 2000,
                }
            ])
            end(endFlow, ctx.from)//finaliza la conversacion 
            //await enviarMensaje(numeroTecnicos, `El cliente ${respuestas[1]} contesto las siguientes preguntas: LUZ EN EL EDIFICIO: ${respuestas[0]}, PERSONA PARA PERMITIR INGRESO AL TECNICO: ${respuestas[2]}, TELEFONO DE CONTACTO: ${respuestas[4]}, MAS DETALLES: ${respuestas[3]}`, '')
            respuestas = []
            return gotoFlow(flowFin)
        }
    )

export default flowPreguntasFinales;  