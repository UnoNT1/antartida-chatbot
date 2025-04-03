import { addKeyword, EVENTS } from '@builderbot/bot'
import end from '../funciones/end.js'

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
        end(endFlow, ctx.from)//finaliza la conversacion  
        fallBack('')    
    })


export default flowFin;    