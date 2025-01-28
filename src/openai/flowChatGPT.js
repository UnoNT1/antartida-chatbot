import { addKeyword, EVENTS } from '@builderbot/bot'
import { mensajeChatGPT, finalizarConversacion } from './historial'
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

const flowChatGPT = addKeyword(EVENTS.ACTION)
    .addAction(
        null,
        async (_, { flowDynamic }) => {
            await flowDynamic([{ body: 'Recolectando información del ascensor...', delay: 1000 }])
        }
    )
    .addAction(
        null,
        async (ctx, { flowDynamic, fallBack }) => {
            const convGPT = await mensajeChatGPT(
                'Información del ascensor disponible: Ascensor nro 1435', prompt)
            //await console.log(convGPT)
            await flowDynamic([{ body: convGPT }])
            if (!convGPT.includes("Resuelto")) {
                await fallBack('');
            } else {
                await finalizarConversacion();
                await flowDynamic([{ body: 'Fin chat con IA' }])
                return ('Fin conversación')
            }
        })