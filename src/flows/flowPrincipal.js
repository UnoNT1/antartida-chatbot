import { addKeyword, EVENTS } from '@builderbot/bot'
import { postIniciarOrden } from '../Fetch/postIniciarOrden.js';
import enviarMensaje from '../funciones/enviarMensajeTecnico.js';
import validarMensaje from '../funciones/validarMensaje.js';
import nombreEmpresa from '../Utils/nombreEmpresa.js';
import flowDireccion from './flowDireccion.js'

let nombreEmp = await nombreEmpresa()
let respuestaOrden

const flowPrincipal = addKeyword(EVENTS.WELCOME)
    .addAction(
        null,
        async (ctx, { flowDynamic, gotoFlow }) => {
            let numero = ctx.from
            let mensaje = ctx.body.toLowerCase()
            //let respuestaOrden

            const mensajesUsuario = validarMensaje(numero, mensaje)
            if(mensaje === 'test'){
                //va al flow test
                return
            }
            
            const reclamo = {
                nrollamada: numero,
                mensaje: mensaje,
                empresa: nombreEmp,
                accion: '1',
                lugar: '0'
            }
                
            respuestaOrden = await postIniciarOrden(reclamo)//devuelve un array con los numeros de los tecnicos
            //await enviarMensaje(respuestaOrden, `Entro un reclamo con el siguiente mensaje "${mensaje}"`, '')

            if(respuestaOrden.length < 1){
                await flowDynamic([
                    {
                        body: 'Aguarde la respuesta del tecnico por favor',
                        delay: 2000
                    }
                ])
            }

            await flowDynamic([
                {
                    body:`Muchas gracias por comunicarse con Ascensores Latorre.`,
                    delay: 2000
                }
            ]) 
            gotoFlow(flowDireccion) 
        }
    )

    const getNrosTecnicos = () => {
        return respuestaOrden
    }

export { flowPrincipal, getNrosTecnicos }