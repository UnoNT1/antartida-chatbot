import { addKeyword, EVENTS } from '@builderbot/bot'
import { mensajeChatGPT, finalizarConversacion } from '../openai/historial.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { flowDireccion } from './flowDireccion.js'
import flowPrincipal from './flowPrincipal.js'
import { generarReclamo } from '../funciones/generarReclamo.js'
import subirNombreEdificio from '../funciones/subirNombreEdificio.js'
import nombreEmpresa from '../Utils/nombreEmpresa.js'
import enviarMensaje from '../funciones/enviarMensajeTecnico.js'
import end from '../funciones/end.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dirPrompts = (nombreEmp) => path.resolve(__dirname, `../openai/prompt${nombreEmp}.txt`)
let reclamo
let primerMensaje


async function getPrompt(empresa) {
    const dirPrompt = dirPrompts(empresa)
    
    return new Promise((resolve, reject) => {
        fs.readFile(dirPrompt, 'utf-8', (err, prompt) => {
            if (err) reject(err);
            resolve(prompt);
        });
    });
}

const flowChatGPT = addKeyword(EVENTS.WELCOME)
    .addAction(
        null,
        async (ctx, { flowDynamic, endFlow }) => {
            const nombreEmp = await nombreEmpresa()
            primerMensaje = ctx.body
            await flowDynamic([{ body: `Muchas gracias por comunicarse con Ascensores ${nombreEmp}.`, delay: 1000 }])
            //
            console.log('primer action')
            let numero = ctx.from
            let mensaje = ctx.body.toLowerCase()
            const prompt = await getPrompt(nombreEmp);
            const convGPT = await mensajeChatGPT(mensaje, prompt, numero)
            await flowDynamic([{ body: convGPT }])
            end(endFlow, numero)//finaliza la conversacion
        })
        .addAction(
            { capture: true},
            async (ctx, { flowDynamic, gotoFlow, fallBack, endFlow }) => {  
                let numero = ctx.from
                let mensaje = ctx.body.toLowerCase()
                const nombreEmp = await nombreEmpresa()
                //
            console.log('segundo action')
                const prompt = await getPrompt(nombreEmp);
                const convGPT = await mensajeChatGPT(mensaje, prompt, numero)  
                await flowDynamic([{ body: convGPT }])
                //
                if (mensaje === "si") {
                    // busco en el contexto el mensaje 'Direccion:....'
                    // { role: 'system', content: 'Dirección: TUCUMAN 1331' }
                    // const contexto = await cargarContexto(ctx.from);

                    if (convGPT.includes('Dirección:')) {
                        reclamo = convGPT.split(' Dirección: ') 
                    }else{
                        reclamo = [mensaje, 'No se pudo tomar la direccion' ]
                    }

                    const numTecnicos = await generarReclamo(numero, reclamo)
                    await subirNombreEdificio(reclamo[1])
                    await enviarMensaje(numTecnicos, `Entro un reclamo. "${reclamo[0]}". Desde este numero: "${numero}". En la dirección: "${reclamo[1]}"`, '')

                    await finalizarConversacion(numero);
                    return gotoFlow(flowPrincipal)
                } else if (mensaje === 'no') {
                    await finalizarConversacion(numero);
                    return gotoFlow(flowDireccion)
                }
                end(endFlow, numero)//finaliza la conversacion
                fallBack('')
        })

function getPrimerMsj(){
    return primerMensaje
}  
function getReclamoGTP(){
    return reclamo
}        
// reg_as00 - dir_as00 - equ_as00 - lug_as00 - fan_as00

export { flowChatGPT, getPrimerMsj, getReclamoGTP };