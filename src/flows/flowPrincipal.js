import { addKeyword, EVENTS } from '@builderbot/bot'
import { getUrl, getNroOrden } from '../Fetch/postIniciarOrden.js';
import flowFin from './flowFin.js';

const flowPrincipal = addKeyword(EVENTS.ACTION)
.addAction(
    null,
    async (_, { flowDynamic }) => {
        const numOrden = await getNroOrden()

        if(numOrden === null){  
            await flowDynamic([
                {
                    body: `Aguarde unos minutos y su orden sera confirmada`,
                    delay: 2000,
                }
            ])
            return
        }

        await flowDynamic([
            {
                body: `El reclamo a sido generado con exito. Su numero de reclamo es ${numOrden}`,
                delay: 2000,
            }
        ])
    })
    .addAction(
        { capture: false},
        async (_, { flowDynamic, gotoFlow }) => {
            const url = await getUrl()
   
            if(url === null){  
                await flowDynamic([
                    {
                        body: `Luego le pasaremos una url para que pueda continuar con el reclamo`,
                        delay: 2000,
                    }
                ])
                return
            }

            await flowDynamic([
                {
                    body: `A continuacion ingrese a esta url para continuar el reclamo ${url} . Uno de nuestros tecnicos se contactara con usted.`,
                    delay: 2000,
                }
            ])
            
        gotoFlow(flowFin)    
    }) 


export default flowPrincipal 