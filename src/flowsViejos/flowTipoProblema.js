import { EVENTS } from "@builderbot/bot";
import { addKeyword } from "@builderbot/bot";
import { mensajeChatGPT, finalizarConversacion, cargarContexto, guardarContexto } from '../openai/historial.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getReclamoGTP } from './flowChatGPT.js'
import { getReclamoDireccion } from "./flowDireccion.js";
import nombreEmpresa from "../Utils/nombreEmpresa.js";
import enviarMensaje from "../funciones/enviarMensajeTecnico.js";
import { getNrosTecnicos } from "../funciones/generarReclamo.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dirPrompts = (nombreEmp) => path.resolve(__dirname, `../openai/promptTipo${nombreEmp}.txt`)
let cargarReclamo = false

async function getPrompt(empresa) {
    const dirPrompt = dirPrompts(empresa)
    
    return new Promise((resolve, reject) => {
        fs.readFile(dirPrompt, 'utf-8', (err, prompt) => {
            if (err) reject(err);
            resolve(prompt);
        });
    });
}

const horaHoy = new Date().getHours()
const minHoy = new Date().getMinutes() < 10 ? `0${new Date().getMinutes()}` : new Date().getMinutes()
const horaCompleta = `${horaHoy}:${minHoy}`
console.log(horaCompleta, 'hora hoy')

const flowTipoProblema = addKeyword(EVENTS.ACTION)
    .addAction(
        null,
        async (_, { flowDynamic }) => {
            flowDynamic([{ body: '¿Desea continuar la conversacion?', delay: 1000  }])
        })
    .addAction(
        { capture: true },
        async (ctx, { flowDynamic, fallBack }) => {
            console.log('Tipo de problema')
            let numero = ctx.from
            let mensaje = ctx.body.toLowerCase()
            const nombreEmp = await nombreEmpresa()
            const prompt = await getPrompt(nombreEmp);
            const convGPT = await mensajeChatGPT(mensaje, prompt, numero)
            //obtener reclamo de comienzo de conversacion
            const reclamoGTP = await getReclamoGTP()
            const reclamoDireccion = await getReclamoDireccion()

            const reclamo = reclamoGTP === undefined ? reclamoDireccion : reclamoGTP

            await flowDynamic([{ 
                body: convGPT,
                delay: 1000  
            }])

            if(cargarReclamo === false){
                await guardarContexto([{
                    role: "system",
                    content: `El motivo del reclamo es: ${reclamo[0]} Ubicado en la direccion: ${reclamo[1]}. en la Hora: ${horaCompleta}`
                }], numero)
                cargarReclamo = true
            }
            convGPT.toLowerCase()
            if (convGPT.includes('tipo de reclamo') || convGPT.includes('Tipo de reclamo')) {
                console.log('convGPT --------------', convGPT)
                const nroTecnicos = await getNrosTecnicos()
                await enviarMensaje(nroTecnicos, convGPT, '')

                await finalizarConversacion(numero)
            }
            await fallBack('')
        }
    )


export default flowTipoProblema    