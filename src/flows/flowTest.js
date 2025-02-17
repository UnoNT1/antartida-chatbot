import { addKeyword } from "@builderbot/bot";
import nombreEmpresa from "../Utils/nombreEmpresa.js"


const flowTest = addKeyword('test')
    .addAction(
        null,
        async (ctx, { flowDynamic }) => {
            console.log('Test flow')
            const nombreEmp = await nombreEmpresa()

            await flowDynamic([
                {
                    body: `Testeado... el chat esta en funcionamiento. ${nombreEmp}`,
                    delay: 2000
                }
            ])
        }
    )


export default flowTest