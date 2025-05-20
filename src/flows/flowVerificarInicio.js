import { EVENTS } from "@builderbot/bot";
import { addKeyword } from "@builderbot/bot";

import { finalizarConversacion, mensajeChatGPT } from "../openai/historial.js";
import nombreEmpresa from "../Utils/nombreEmpresa.js";
import { flowInicio } from "./flowInicio.js";

let contieneDatos = false
const flowVerificarInicio = addKeyword(EVENTS.WELCOME)
    .addAction(
        null,
        async (ctx, { flowDynamic, endFlow, gotoFlow }) => {
            const mensaje = ctx.body

            await mensajeChatGPT(mensaje, '', '1')
            let respuesta2 = await mensajeChatGPT('El primer mensaje posee datos sobre el motivo del reclamo? ya sea si esta encerrado o algun equipo esta funcionando mal o informa algun defecto en el equipo', 'Eres un asistente virtual especializado en reclamos de mantenimiento de ascensores, montavehiculos, sistema de acceso(SAR) o porton electrico/corredizo. Teniendo en cuenta que esta persona que mando el mensaje esta tratando de generar un reclamo. Debes responder siempre incluyendo un "Si" o un "No" si encuentras datos sobre el motivo del reclamo o si solo es un mensaje de presentacion como por ejemplo un hola', '1')

            respuesta2 = respuesta2.toLowerCase()
            console.log('respuesta2 en verificar', respuesta2)
            if (respuesta2.startsWith('sí')){
                contieneDatos = true
            } else {
                contieneDatos = false
            }
            finalizarConversacion('1')
            gotoFlow(flowInicio)
        }
    )

    const getContieneDatos = () => {
        return contieneDatos
    }

    export { flowVerificarInicio, getContieneDatos };