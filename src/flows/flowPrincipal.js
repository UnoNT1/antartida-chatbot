import { addKeyword, EVENTS } from '@builderbot/bot'
import { getUrl } from '../Fetch/postIniciarOrden.js';
import flowFin from './flowFin.js';

const flowPrincipal = addKeyword(EVENTS.ACTION)
    .addAction(
        null,
        async (_, { flowDynamic, gotoFlow }) => {
            const url = await getUrl()
   
            if(url === null){  
                await flowDynamic([
                    {
                        body: `Su reclamo ya a sido cargado`,
                        delay: 2000,
                    }
                ])
                return
            }

            await flowDynamic([
                {
                    body: `A continuacion ingrese a esta link para continuar el reclamo ${url} . Uno de nuestros tecnicos se contactara con usted.`,
                    delay: 2000,
                }
            ])
            
        gotoFlow(flowFin)    
    }) 


export default flowPrincipal 