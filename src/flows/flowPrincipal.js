import { addKeyword, EVENTS } from '@builderbot/bot'
import { getUrl } from '../Fetch/postIniciarOrden.js';
import flowFin from './flowFin.js';
import flowTipoProblema from './flowTipoProblema.js';
import end from '../funciones/end.js';

const flowPrincipal = addKeyword(EVENTS.ACTION)
    .addAction(
        null,
        async (ctx, { flowDynamic, gotoFlow, endFlow }) => {
            const url = await getUrl()
   
            if(url === null){  
                await flowDynamic([
                    {
                        body: `Su reclamo ya a sido cargado`,
                        delay: 2000,
                    }
                ])
                //return gotoFlow(flowTipoProblema)   
                return gotoFlow(flowFin)
            }

            await flowDynamic([
                {
                    body: `A continuacion ingrese a esta link para continuar el reclamo ${url} . Uno de nuestros tecnicos se contactara con usted.`,
                    delay: 2000,
                }
            ])
           
        end(endFlow, ctx.from)//finaliza la conversacion 
        return gotoFlow(flowFin)    
    }) 


export default flowPrincipal 