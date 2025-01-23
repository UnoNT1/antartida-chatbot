import { addKeyword } from "@builderbot/bot";


const flowTest = addKeyword('test')
    .addAction(
        null,
        async (ctx, { flowDynamic }) => {
            console.log('Test flow')
            
            await flowDynamic([
                {
                    body:`Testeado... el chat esta en funcionamiento`,
                    delay: 2000
                }
            ])    
        }
        
    )


    export default flowTest