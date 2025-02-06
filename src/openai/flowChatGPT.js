import { addKeyword, EVENTS } from '@builderbot/bot'
import { mensajeChatGPT, finalizarConversacion, cargarContexto, guardarContexto } from './historial.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import flowDireccion from '../flows/flowDireccion.js'
import flowPrincipal from '../flows/flowPrincipal.js'
import { generarReclamo } from '../funciones/generarReclamo.js'
import subirNombreEdificio from '../funciones/subirNombreEdificio.js'
import nombreEmpresa from '../Utils/nombreEmpresa.js'
import enviarMensaje from '../funciones/enviarMensajeTecnico.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dirPrompts = path.resolve(__dirname, 'promptIncast.txt')
console.log(dirPrompts, 'flowChatGPT')
let reclamo
let primerMensaje

async function getPrompt() {
    return new Promise((resolve, reject) => {
        fs.readFile(dirPrompts, 'utf-8', (err, prompt) => {
            if (err) reject(err);
            resolve(prompt);
        });
    });
}

const flowChatGPT = addKeyword(EVENTS.WELCOME)
    .addAction(
        null,
        async (ctx, { flowDynamic }) => {
            const nombreEmp = await nombreEmpresa()
            primerMensaje = ctx.body
            await flowDynamic([{ body: `Muchas gracias por comunicarse con Ascensores ${nombreEmp}.`, delay: 1000 }])
            //
            let numero = ctx.from
            let mensaje = ctx.body.toLowerCase()
            const prompt = await getPrompt();
            const convGPT = await mensajeChatGPT(mensaje, prompt, numero)
            await flowDynamic([{ body: convGPT }])
        })
        .addAction(
            { capture: true},
            async (ctx, { flowDynamic, gotoFlow, fallBack }) => {  
                let numero = ctx.from
                let mensaje = ctx.body.toLowerCase()
                //
                const prompt = await getPrompt();
                const convGPT = await mensajeChatGPT(mensaje, prompt, numero)  
                await flowDynamic([{ body: convGPT }])
                //
                if (mensaje === "si") {
                    // busco en el contexto el mensaje 'Direccion:....'
                    // { role: 'system', content: 'Dirección: TUCUMAN 1331' }
                    // const contexto = await cargarContexto(ctx.from);

                    if (convGPT.includes('Dirección:')) {
                        reclamo = convGPT.split(' Dirección: ') 
                    }

                    const numTecnicos = await generarReclamo(numero, reclamo)
                    await subirNombreEdificio(reclamo[1])
                    //await enviarMensaje(numTecnicos, `Entro un reclamo. Motivo: "${reclamo[0]}". Desde este numero: "${numero}". En la dirección: "${reclamo[1]}"`, '')

                    await finalizarConversacion(numero);
                    gotoFlow(flowPrincipal)
                    return ('Fin conversación')
                } else if (mensaje === 'no') {
                    await finalizarConversacion(numero);
                    gotoFlow(flowDireccion)
                }
                fallBack('')
        })

function getPrimerMsj(){
    return primerMensaje
}        
// reg_as00 - dir_as00 - equ_as00 - lug_as00 - fan_as00

export { flowChatGPT, getPrimerMsj };