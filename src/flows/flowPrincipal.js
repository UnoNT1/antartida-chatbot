import { addKeyword, EVENTS } from '@builderbot/bot'
import { getUrl, postIniciarOrden } from '../Fetch/postIniciarOrden.js';
import enviarMensaje from '../funciones/enviarMensajeTecnico.js';
import validarMensaje from '../funciones/validarMensaje.js';
import nombreEmpresa from '../Utils/nombreEmpresa.js';
import { getOrdenes } from '../funciones/guardarOrdenes.js';
import { fechaActual, horaActual } from '../Utils/fechaHoraActual.js';

let nombreEmp = await nombreEmpresa()

const flowPrincipal = addKeyword(EVENTS.WELCOME)
    .addAction(
        null,
        async (ctx, { flowDynamic }) => {
            let numero = ctx.from
            //let nombre = ctx.name
            let mensaje = ctx.body
            let respuestaOrden

            const mensajesUsuario = validarMensaje(numero, mensaje)
            //const ordenesExistentes = getOrdenes()
            //const fechaHoy = fechaActual()
            
            //const thisOrden = ordenesExistentes.slice().find(orden => orden.tre_cl12 === numero)

            
            const reclamo = {
                nrollamada: numero,
                mensaje: mensaje,
                empresa: nombreEmp,
                accion: '1',
                lugar: '0'
            }
            
            respuestaOrden = await postIniciarOrden(reclamo)
            if(respuestaOrden){

                if(respuestaOrden.startsWith('Se agrego')){
                    const msjUser = mensajesUsuario[numero]

                    console.log('Reclamo existente: ', thisOrden)
                    await enviarMensaje(respuestaOrden, `Mas detalles sobre el reclamo: "${msjUser.mensaje}"`, '')
                    await flowDynamic([
                        {
                            body:`Continue el reclamo a travez del formulario`,
                            delay: 2000
                        }
                    ])
                    return
                }

                console.log('Reclamo iniciado: ', respuestaOrden)

                await enviarMensaje(respuestaOrden, `Entro un reclamo con el siguiente mensaje "${mensaje}"`, '')
                
                const url = await getUrl();
                
                await flowDynamic([
                    {
                        body:`Muchas gracias por comunicarse con Ascensores Antartida. Haga Click en ${url}`,
                        delay: 2000
                    }
                ])    
            }
        }
    )

export default flowPrincipal