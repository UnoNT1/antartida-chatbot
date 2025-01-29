
//import { join } from 'path'
import { createBot, createProvider, createFlow } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'

import { flowPrincipal } from './flows/flowPrincipal.js'
//import flowSecundario from './flows/flowSecundario.js'
import flowConstante from './flows/flowConstante.js'
import flowTest from './flows/flowTest.js'
import flowDireccion from './flows/flowDireccion.js'
import flowChatGPT from './openai/flowChatGPT.js'

const PORT = process.env.PORT ?? 3008


const main = async () => {
    const adapterFlow = createFlow([flowPrincipal, flowTest, flowDireccion, flowChatGPT])

    const adapterProvider = createProvider(Provider)
    const adapterDB = new Database()

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    //flowSecundario()
    flowConstante()
    httpServer(+PORT)

    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body
            await bot.sendMessage(number, message, { media: urlMedia ?? null })
            return res.end('sended')
        })
    )
}

main()
