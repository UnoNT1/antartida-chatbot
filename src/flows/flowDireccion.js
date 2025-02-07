import { addKeyword, EVENTS } from "@builderbot/bot";
import flowPrincipal from './flowPrincipal.js'
import nombreEmpresa from "../Utils/nombreEmpresa.js";
import consultaMySql from "../Utils/consultaMySql.js";
import { generarReclamo } from "../funciones/generarReclamo.js";
import { getPrimerMsj } from "./flowChatGPT.js";
import enviarMensaje from "../funciones/enviarMensajeTecnico.js";
import subirNombreEdificio from "../funciones/subirNombreEdificio.js";

let reclamo
//este flow deviene del la respuesta 'no' del usuario a la direccion buscada por la I.A.
const flowDireccion = addKeyword(EVENTS.ACTION)
    .addAction(null, async (_, { flowDynamic }) => {
        await flowDynamic([
            {
                body: `Por favor, escriba solo la direccion o el nombre del edificio.`,
                delay: 2000,
            }
        ])
    })
    .addAction(
        { capture: true },
        async (ctx, { gotoFlow, fallBack }) => {
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
                console.log(direccion, 'aca la dir del edificio')
                
                
                reclamo = [
                    primerMensaje,
                    direccion[0].dir_as00 || mensajeDir
                ]
                console.log(reclamo, 'reclamo en flow direccion')
                const numTecnicos = await generarReclamo(ctx.from, reclamo)
                //await enviarMensaje(numTecnicos, `Entro un reclamo. Motivo: "${reclamo[0]}". Desde este numero: "${numero}". En la dirección: "${reclamo[1]}"`, '')

                if(direccion[0].dir_as00){
                    await subirNombreEdificio(reclamo[1])
                }
                gotoFlow(flowPrincipal)
            } catch (error) {
               // console.error('Error al obtener la dirección:', error);
                fallBack(`Hubo un error al obtener la dirección. Por favor, inténtelo de nuevo.`);
            }
        
    })

export default flowDireccion