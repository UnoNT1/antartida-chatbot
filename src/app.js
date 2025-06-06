
//import { join } from 'path'
import dotenv from 'dotenv'
import { createBot, createProvider, createFlow } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'

//import flowPrincipal from './flows/flowPrincipal.js' VIEJOS
//import { flowChatGPT } from './flows/flowChatGPT.js' VIEJOS
//import flowTipoProblema from './flows/flowTipoProblema.js' VIEJOS
import flowConstante from './flows/flowConstante.js'
import flowTest from './flows/flowTest.js'
import flowEquipo from './flows/flowEquipo.js'
import flowFin from './flows/flowFin.js'

import { flowInicio } from './flows/flowInicio.js'
import flowPreguntasFinales from './flows/flowPreguntasFinales.js'
import flowFueraServicio from './flows/flowFueraServicio.js'
import { flowVerificarInicio } from './flows/flowVerificarInicio.js'

const PORT = process.env.PORT ?? 3020
dotenv.config()

const main = async () => {
    const adapterFlow = createFlow([ flowInicio, flowEquipo, flowFin, flowPreguntasFinales, flowTest, flowFueraServicio, flowVerificarInicio ])
    //const adapterFlow = createFlow([ flowChatGPT , flowPrincipal, flowTipoProblema ])
    const adapterProvider = createProvider(Provider)
    //const adapterProvider = createProvider(Provider, {usePairingCode: true, phoneNumber: process.env.PHONE_NUMBER})
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
