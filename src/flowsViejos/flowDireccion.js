import { addKeyword, EVENTS } from "@builderbot/bot";
import flowPrincipal from '../flows/flowPrincipal.js'
import nombreEmpresa from "../Utils/nombreEmpresa.js";
import consultaMySql from "../Utils/consultaMySql.js";
import { generarReclamo } from "../funciones/generarReclamo.js";
import { getPrimerMsj } from "./flowChatGPT.js";
import subirNombreEdificio from "../funciones/subirNombreEdificio.js";
import end from "../funciones/end.js";

let reclamo
let numTecnicos
//este flow deviene del la respuesta 'no' del usuario a la direccion buscada por la I.A.
const flowDireccion = addKeyword(EVENTS.ACTION)
    .addAction(null, async (ctx, { flowDynamic, endFlow }) => {
        await flowDynamic([
            {
                body: `Por favor, escriba solo la direccion o el nombre del edificio.`,
                delay: 2000,
            }
        ])
        end(endFlow, ctx.from)//finaliza la conversacion
    })
    .addAction(
        { capture: true },
        async (ctx, { gotoFlow, endFlow }) => {
            const mensajeDir = ctx.body.toUpperCase()
            let nombreEmp = await nombreEmpresa()
            let primerMensaje = await getPrimerMsj()
                
            try {
                const query = `SELECT reg_as00, tit_as00, dir_as00, cta_as00, equ_as00 FROM lpb_as00 WHERE emp_as00 = ? and dir_as00 = ?`
                const direccion = await consultaMySql(query, [nombreEmp, mensajeDir])
                /*[ respuesta direccion
                    {
                    reg_as00: 960,
                    tit_as00: 'Aires de General Paz',
                    dir_as00: '25 DE MAYO 1518/20',
                    cta_as00: 1433,
                    equ_as00: '0002-ASC1'
                    }
                ]*/
               
               reclamo = [
                   primerMensaje,
                   direccion[0].dir_as00 || mensajeDir
                ]
                console.log(reclamo, 'reclamo en flow direccion')
                numTecnicos = await generarReclamo(ctx.from, reclamo)
                await enviarMensaje(numTecnicos, `Entro un reclamo. Motivo: "${reclamo[0]}". Desde este numero: "${numero}". En la dirección: "${reclamo[1]}"`, '')
                
                if(direccion[0].dir_as00){
                    await subirNombreEdificio(reclamo[1])
                }
                end(endFlow, ctx.from)//finaliza la conversacion                
                gotoFlow(flowPrincipal)
            } catch (error) {
               // console.error('Error al obtener la dirección:', error);
               console.log(numTecnicos, 'num tecnicos en catch de flowDireccion-----')
               if(numTecnicos.length > 0){
                gotoFlow(flowPrincipal)
               }
            }
    })
 
function getReclamoDireccion(){
    return reclamo
}  

export { flowDireccion, getReclamoDireccion}