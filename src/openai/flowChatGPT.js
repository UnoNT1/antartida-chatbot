import { addKeyword, EVENTS } from '@builderbot/bot'
import { mensajeChatGPT, finalizarConversacion, cargarContexto } from './historial.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dirPrompts = path.resolve(__dirname, 'prompt.txt')
console.log(dirPrompts, 'flowChatGPT')

const prompt = await new Promise((resolve, reject) => {
    fs.readFile(dirPrompts, 'utf-8', (err, prompt) => {
        if (err) reject(err);
        resolve(prompt)
    })
})

let direccion

const flowChatGPT = addKeyword(EVENTS.WELCOME)
    /*.addAction(
        null,
        async (_, { flowDynamic }) => {
            await flowDynamic([{ body: 'Escribe el reclamo', delay: 1000 }])
        }
    )*/
    .addAction(
        { capture: true },
        async (ctx, { flowDynamic, fallBack }) => {
            const convGPT = await mensajeChatGPT(
                ctx.body, prompt)
            //await console.log(convGPT)
            await flowDynamic([{ body: convGPT }])
            if(ctx.body === "si") {
                //busco en el contesto el mensaje 'Direccion:....'
                // { role: 'system', content: 'Dirección: TUCUMAN 1331' }
                const contexto = await cargarContexto();

                contexto.forEach(element => {
                    if(element.content.includes('Direccion:')) {
                        direccion = element.content
                    }
                })
                direccion = direccion.split(': ')[1]

                await finalizarConversacion();
                await flowDynamic([{ body: 'Fin chat con IA' }])
                return ('Fin conversación')
            }else if (!convGPT.includes("asdzxc")) {
                await fallBack('');
            }else {
                await finalizarConversacion();
                await flowDynamic([{ body: 'Fin chat con IA' }])
                return ('Fin conversación')
            }
        })

// reg_as00 - dir_as00 - equ_as00 - lug_as00 - fan_as00

export default flowChatGPT;