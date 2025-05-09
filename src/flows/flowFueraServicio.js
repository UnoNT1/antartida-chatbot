import { addKeyword, EVENTS } from '@builderbot/bot'
import nombreEmpresa from "../Utils/nombreEmpresa.js";

const flowFueraServicio = addKeyword(EVENTS.ACTION)//(EVENTS.WELCOME)
    .addAction(
        null,
        async (ctx, { flowDynamic, endFlow, gotoFlow }) => {
            const nomEmp = await nombreEmpresa()
            let numAtencionCl

            if(nomEmp === 'Latorre'){
                numAtencionCl = '3585603332'
            }else if(nomEmp === 'Servicar'){
                numAtencionCl = '3517363635'
            }else if(nomEmp === 'Incast'){
                numAtencionCl = '0800 888 4990'
            } else if(nomEmp === 'Antartida'){
                numAtencionCl = '3516674325'
            } else{
                numAtencionCl = '0800 888 4990'
            }

            await flowDynamic([{ body: `Muchas gracias por comunicarse con Ascensores ${nomEmp}. En este momento este Bot se encuentra fuera de servicio, porfavor comunicarse al ${numAtencionCl} para poder generar su reclamo`, delay: 1000 }])
            // 
        }
    )

    export default flowFueraServicio
