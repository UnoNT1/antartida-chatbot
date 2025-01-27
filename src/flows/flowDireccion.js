import { addKeyword, EVENTS } from "@builderbot/bot";
import conn from "../conexion.js";
import { getUrl, getNroOrden } from "../Fetch/postIniciarOrden.js";
import { getNrosTecnicos } from './flowPrincipal.js'
import consultaMySql from "../Utils/consultaMySql.js";

const flowDireccion = addKeyword(EVENTS.ACTION)
    .addAction(null, async (_, { flowDynamic }) => {
        await flowDynamic([
            {
                body: `Por favor, ubique el numero de ascensor en el mismo cartel donde obtuvo este numero de telefono y conteste este mensaje solo con ese numero del ascensor.`,
                delay: 2000,
            }
        ])
    })
    .addAction({ capture: true }, async (ctx, { gotoFlow, fallBack }) => {
        console.log(`\nNumero ascensor: |${ctx.body}|`);
        const numAscensor = parseInt(ctx.body, 10)
        const nrosTecnicos = getNrosTecnicos()

        if (isNaN(numAscensor)) {
            //await enviarMensaje(nrosTecnicos, `Mas detalles sobre el reclamo: "${msjUser.mensaje}"`, '')

            fallBack(`Este ultimo mensaje sera enviado a los tecnicos, para poder continuar necesito solamente el numero del ascensor`)
        } else {
            try {
                const query = `SELECT reg_as00, tit_as00, dir_as00, cta_as00, equ_as00 FROM lpb_as00 WHERE reg_as00 = ?`
                const direccion = await consultaMySql(query, [numAscensor])
                /*[ respuesta direccion
                    {
                    reg_as00: 960,
                    tit_as00: 'Aires de General Paz',
                    dir_as00: '25 DE MAYO 1518/20',
                    cta_as00: 1433,
                    equ_as00: '0002-ASC1'
                    }
                ]*/
                if (direccion.length > 0) {
                    const direccionInfo = direccion[0];
                    const nroOrden = getNroOrden()

                    const query = 'UPDATE lpb_cl12 SET cta_cl12 = ?, tit_cl12 = ?, dom_cl12 = ?, c01_cl12 = ? WHERE reg_cl12 = ?'
                    const values = [direccionInfo.cta_as00, direccionInfo.tit_as00, direccionInfo.dir_as00, direccionInfo.equ_as00, nroOrden]

                    const orden = await consultaMySql(query, values)
                    console.log(orden)
                } else {
                    fallBack(gotoFlow(flowDireccion));
                }
            } catch (error) {
                console.error('Error al obtener la dirección:', error);
                fallBack(`Hubo un error al obtener la dirección. Por favor, inténtelo de nuevo más tarde.`);
            }
        }
    })
    .addAction(null, async (_, { flowDynamic }) => {
        await flowDynamic([
            {
                body: `Gracias, con ese numero podremos ubicar la direccion del edificio desde donde genera el reclamo.`,
                delay: 2000,
            }
        ])
    })
    .addAction(null, async (_, { flowDynamic }) => {
        const url = getUrl()
        await flowDynamic([
            {
                body: `A continuacion ingrese a esta url para continuar el reclamo ${url} .Uno de nuestros tecnicos se contactara con usted.`,
                delay: 2000,
            }
        ])
    })

export default flowDireccion