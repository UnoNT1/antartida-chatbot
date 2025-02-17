import { addKeyword, EVENTS } from '@builderbot/bot'

const flowFin = addKeyword(EVENTS.ACTION) 
    .addAction(
        { capture: true},
        async (ctx, { flowDynamic, fallBack }) => {
            await flowDynamic([
                {
                    body: `Aguarde la respuesta de un Tecnico.`,
                    delay: 2000,
                }
            ])
        fallBack('')    
    })


export default flowFin;    