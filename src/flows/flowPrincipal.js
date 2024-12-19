import { addKeyword, EVENTS } from '@builderbot/bot'
import fs from 'fs'
import { getUrl, postIniciarOrden } from '../Fetch/postIniciarOrden.js';
import enviarMensaje from '../funciones/enviarMensajeTecnico.js';
import validarMensaje from '../funciones/validarMensaje.js';
import { debounce } from "../Utils/debounce.js"

let debouncedEnviarMensaje;
let ultimoMensajeEnviado = false;//variable para el debounce
let nombreEmpresa = await new Promise((resolve, reject) => {
    //lee el nombre de la empresa guardado en un archivo txt dentro de la carpeta Utils
    fs.readFile('./src/Utils/empresa.txt', 'utf8', (err, data)=> {
        if(err){
            reject(err)
            console.error('error al leer archivo', err)
            return
        } 
        resolve(data);
    })
})

const flowPrincipal = addKeyword(EVENTS.WELCOME)
    .addAction(
        null,
        async (ctx, { flowDynamic }) => {
            let numero = ctx.from
            //let nombre = ctx.name
            let mensaje = ctx.body
            let nroTecnicos

            let mensajesUsuario = validarMensaje(numero, mensaje)
            
            
            const reclamo = {
                nrollamada: numero,
                mensaje: mensaje,
                empresa: nombreEmpresa,
                accion: '1',
                lugar: '0'
            }
            
            nroTecnicos = await postIniciarOrden(reclamo)
            enviarMensaje(nroTecnicos, `Entro un reclamo con el siguiente mensaje "${mensaje}"`, '')
            
            const url = await getUrl();
            
            if(!debouncedEnviarMensaje){
                debouncedEnviarMensaje = debounce(
                    await flowDynamic([
                        {
                            body:`Muchas gracias por comunicarse con Ascensores Antartida. Haga Click en ${url}`,
                            delay: 2000
                        }
                    ]), 2000)   
            }

            if(ultimoMensajeEnviado){
                //comprueba si es false o true para activar el debounce y enviar un mensaje diferente
                mensajesUsuario[numero]
                await enviarMensaje(nroTecnicos, `Mas detalles sobre el reclamo: "${mensajesUsuario[numero].mensaje}"`, '')
                await flowDynamic([
                    {
                        body:`Continue el reclamo a travez del formulario 👇 http://www.unont.com.ar/yavoy/formato.php?r=80070142&n36698&t=10`,
                        delay: 2000
                    }
                ])
                return
            }
            ultimoMensajeEnviado = true  //variable para activar el debounce       
        }
    )

export default flowPrincipal