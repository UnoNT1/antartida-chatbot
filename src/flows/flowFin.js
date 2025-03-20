import { addKeyword, EVENTS } from '@builderbot/bot'
import { finalizarConversacion } from '../openai/historial.js'

const flowFin = addKeyword(EVENTS.ACTION) 
    .addAction(
        { capture: true},
        async (ctx, { flowDynamic, fallBack, endFlow }) => {
            await flowDynamic([
                {
                    body: `Aguarde la respuesta de un Tecnico.`,
                    delay: 2000,
                }
            ])
        setTimeout(async()=>{
            await finalizarConversacion(ctx.from)
            return endFlow()
        }, 15000)    
        fallBack('')    
    })


export default flowFin;    