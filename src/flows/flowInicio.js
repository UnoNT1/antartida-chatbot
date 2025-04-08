import { addKeyword, EVENTS } from '@builderbot/bot'
import { mensajeChatGPT, finalizarConversacion } from '../openai/historial.js'
import nombreEmpresa from '../Utils/nombreEmpresa.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import end from '../funciones/end.js'
import tomarDatosReclamo from '../funciones/tomarDatosReclamo.js'
import { generarReclamo } from '../funciones/generarReclamo.js'
import consultaMySql from '../Utils/consultaMySql.js'
import flowEquipo from './flowEquipo.js'
import subirNombreEdificio from '../funciones/subirNombreEdificio.js'
import logger from "../Utils/historico.js";


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

let reclamo = {}
let equipos = []

const flowInicio = addKeyword(EVENTS.WELCOME)
    .addAction(
        null,
        async (ctx, { flowDynamic, endFlow }) => {
            const nombreEmp = await nombreEmpresa()
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
        async (ctx, { flowDynamic, fallBack, gotoFlow, endFlow }) => {
            let numero = ctx.from
            let mensaje = ctx.body.toLowerCase()
            const nombreEmp = await nombreEmpresa()
            //
        console.log('segundo action')
            const prompt = await getPrompt(nombreEmp);
            const convGPT = await mensajeChatGPT(mensaje, prompt, numero)  
            await flowDynamic([{ body: convGPT }])

            //Genera el reclamo y toma los datos del reclamo
            //variables para comprobar si la I.A. confirma el reclamo
            const motivo = convGPT.includes('Motivo del reclamo') 
            const direccion = convGPT.includes('Dirección') || convGPT.includes('Direccion')
            const edificio = convGPT.includes('Edificio') || convGPT.includes('edificio') 
            const equipo = convGPT.includes('Equipo')
            if (motivo && direccion && edificio && equipo) {
                reclamo = tomarDatosReclamo(convGPT) 
                /*{
                    'Motivo del reclamo': 'Ascensor, Montavehículo, SAR con problemas',
                    'Dirección': 'Jujuy 8',
                    Edificio: 'EDIFICIO NARITA IV',
                    Equipo: 'Ascensor'
                }*/
                //generar reclamo aca
                //await generarReclamo(numero, [reclamo['Mo'], reclamo['Di'], reclamo['Ed']])
                //
                //
               const direc = reclamo.Di.toUpperCase().replace(/\.$/, '').trim(); //elimina el punto final y saca espacios
               await finalizarConversacion(numero);

               try {
                    const query = 'SELECT abr_as00, dir_as00, cta_as00, equ_as00, tit_as00, reg_as00 FROM lpb_as00 WHERE dir_as00 = ?'
                    equipos = await consultaMySql(query, [direc]);
                    await subirNombreEdificio(direc)

                    console.log('equipo en flowInicio', equipo)
                    return gotoFlow(flowEquipo)
                } catch (error) {
                    logger.error('Error en la consulta MySQL en flowInicio.js:', error);
                    return gotoFlow(flowEquipo)
                }
            }
            end(endFlow, numero)//finaliza la conversacion
            fallBack('')
        }
    )

 
function getEquipos(){
    equipos = equipos.map(obj => obj['abr_as00']);

    return [
        {
            equiposDB: equipos, 
        },
        {
            equipoR: reclamo.Eq.toUpperCase().replace(/\.$/, '')
        }    
    ]
}     

export { flowInicio, getEquipos };