import { addKeyword } from "@builderbot/bot";
import { getUrl, postIniciarOrden } from '../Fetch/postIniciarOrden.js';


const flowTest = addKeyword('test')
    .addAction(
        null,
        async (ctx, { flowDynamic }) => {
            console.log('Test flow')
            //await postIniciarOrden(reclamo)
            
            //const url = await getUrl();
            
            await flowDynamic([
                {
                    body:`Muchas gracias por comunicarse con Ascensores Antartida. Esto es un Test`,
                    delay: 2000
                }
            ])    
        }
        
    )


    export default flowTest