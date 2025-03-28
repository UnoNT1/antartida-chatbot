import { addKeyword, EVENTS } from '@builderbot/bot'
import { mensajeChatGPT, finalizarConversacion, cargarContexto, guardarContexto } from '../openai/historial.js'
import nombreEmpresa from '../Utils/nombreEmpresa.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import end from '../funciones/end.js'
import tomarDatosReclamo from '../funciones/tomarDatosReclamo.js'
import consultaMySql from '../Utils/consultaMySql.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dirPrompts = (nombreEmp) => path.resolve(__dirname, `../openai/prompt${nombreEmp}2.txt`)

async function getPrompt(empresa) {
    const dirPrompt = dirPrompts(empresa)
    
    return new Promise((resolve, reject) => {
        fs.readFile(dirPrompt, 'utf-8', (err, prompt) => {
            if (err) reject(err);
            resolve(prompt);
        });
    });
}

let primerMensaje
const flowInicio = addKeyword(EVENTS.WELCOME)
    .addAction(
        null,
        async (ctx, { flowDynamic, endFlow }) => {
            const nombreEmp = await nombreEmpresa()
            primerMensaje = ctx.body
            await flowDynamic([{ body: `Muchas gracias por comunicarse con Ascensores ${nombreEmp}.`, delay: 1000 }])
            //
            console.log('primer action')
            let numero = ctx.from
            let mensaje = ctx.body.toLowerCase()
            const prompt = await getPrompt(nombreEmp);
            const convGPT = await mensajeChatGPT(mensaje, prompt, numero)
            await flowDynamic([{ body: convGPT }])
            end(endFlow, numero)//finaliza la conversacion
    })
    .addAction(
        { capture: true },
        async (ctx, { flowDynamic, fallBack, endFlow }) => {
            let numero = ctx.from
            let mensaje = ctx.body.toLowerCase()
            const nombreEmp = await nombreEmpresa()
            //
        console.log('segundo action')
            const prompt = await getPrompt(nombreEmp);
            const convGPT = await mensajeChatGPT(mensaje, prompt, numero)  
            await flowDynamic([{ body: convGPT }])

            //Genera el reclamo y toma los datos del reclamo
            if (convGPT.includes('Motivo del reclamo')) {
                let reclamo = tomarDatosReclamo(convGPT) 
                console.log(reclamo, 'reclamo en flowInicio')
                /*{
                    'Motivo del reclamo': 'Ascensor, Montavehículo, SAR con problemas',
                    'Dirección': 'Jujuy 8',
                    Edificio: 'EDIFICIO NARITA IV',
                    Equipo: 'Ascensor'
                }*/
               const direccion = reclamo.Dirección.toUpperCase().replace(/\.$/, ''); //elimina el punto final
                const query = 'SELECT abr_as00, dir_as00, cta_as00, equ_as00, tit_as00, reg_as00 FROM lpb_as00 WHERE emp_as00 = ? and dir_as00 = ?'
                try {
                    const ascensores = await consultaMySql(query, [nombreEmp.trim(), direccion.trim()]);
                    console.log(ascensores, 'ascensores en flowInicio', direccion, nombreEmp);
                } catch (error) {
                    console.error('Error en la consulta MySQL:', error);
                }
            }
            end(endFlow, numero)//finaliza la conversacion
            fallBack('')
        }
    )

export default flowInicio;