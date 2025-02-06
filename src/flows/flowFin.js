import { addKeyword, EVENTS } from '@builderbot/bot'

const flowFin = addKeyword(EVENTS.ACTION) 
    .addAction(
        { capture: true},
        async (__dirname, { flowDynamic }) => {
            await flowDynamic([
                {
                    body: `Aguarde la respuesta de un Tecnico.`,
                    delay: 2000,
                }
            ])
    })


export default flowFin;    