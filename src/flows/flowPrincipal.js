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
            
            const thisOrden = ordenesExistentes.slice().reverse().find(orden => orden.tre_cl12 === numero)

            
            const reclamo = {
                nrollamada: numero,
                mensaje: mensaje,
                empresa: nombreEmp,
                accion: '1',
                lugar: '0'
            }
            
            nroTecnicos = await postIniciarOrden(reclamo)
            if(nroTecnicos){
                console.log('Reclamo iniciado: ', nroTecnicos)

                await enviarMensaje(nroTecnicos, `Entro un reclamo con el siguiente mensaje "${mensaje}"`, '')
                
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