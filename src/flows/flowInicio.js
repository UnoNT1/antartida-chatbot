import { addKeyword, EVENTS } from '@builderbot/bot'
import { mensajeChatGPT, finalizarConversacion } from '../openai/historial.js'
import nombreEmpresa from '../Utils/nombreEmpresa.js'
import end from '../funciones/end.js'
import { generarReclamo } from '../funciones/generarReclamo.js'
import consultaMySql from '../Utils/consultaMySql.js'
import flowEquipo from './flowEquipo.js'
import subirNombreEdificio from '../funciones/subirNombreEdificio.js'
import logger from "../Utils/historico.js";
import getPrompt from '../Utils/getPrompt.js'
import tomarDatosReclamo from '../funciones/tomarDatosReclamo.js'
import clasificarEquipo from '../funciones/clasificarEquipo.js'
import { error } from 'console'
import { setNroOrden } from '../Fetch/postIniciarOrden.js'
import copiaConv from '../funciones/convReclamoSinConfirmar.js'

let dataReclamo = {}
let equipos = []
let confirmoFlow = false //esta variable sirve para que el flujo no empiece de cero en otra parte de la conversacion. Pasaba que al enviar dos mensajes seguidos en el flow de preguntasFinales, volvia a arrancar el flujo desde el inicio.
let verificar = {
    conf : confirmoFlow,
    num : ''
}

const flowInicio = addKeyword(EVENTS.WELCOME)
    .addAction(
        null,
        async (ctx, { flowDynamic, endFlow, gotoFlow }) => {
            let numero = ctx.from
            let mensaje = ctx.body.toLowerCase()

            if(verificar.num !== numero){
                confirmoFlow = false
                setNroOrden('')
                copiaConv(numero)
            }


            if(verificar.conf){
                console.log('entra en true confirmar flow 1111....................')
                return
            }else {
                const nombreEmp = await nombreEmpresa()
                await flowDynamic([{ body: `Muchas gracias por comunicarse con Ascensores ${nombreEmp}.`, delay: 1000 }])
                //
                console.log('primer action')
                const prompt = await getPrompt(nombreEmp);
                const convGPT = await mensajeChatGPT(mensaje, prompt, numero)
                await flowDynamic([{ body: convGPT }])
                end(endFlow, numero, gotoFlow)//finaliza la conversacion
            }

    })
    .addAction(
        { capture: true },
        async (ctx, { flowDynamic, fallBack, gotoFlow, endFlow }) => {
            let numero = ctx.from
            let mensaje = ctx.body.toLowerCase()
            const nombreEmp = await nombreEmpresa()
            
            console.log(verificar, 'verificarrrr')
            if(verificar.conf){
                console.log('entra en true confirmar flow 2222....................')
                return
            } else {
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
                dataReclamo = tomarDatosReclamo(convGPT) //obtiene los data:
                /*{
                    'Mo': 'Ascensor, Montavehículo, SAR con problemas',
                    'Di': 'Jujuy 8',
                    Ed: 'EDIFICIO NARITA IV',
                    Eq: 'Ascensor'
                }*/

                if(nombreEmp !== 'Demo'){
                    await generarReclamo(numero, dataReclamo)
                }	
                const direc = dataReclamo.Di.toUpperCase().replace(/\.$/, '').trim(); //elimina el punto final y saca espacios
                
                try {
                    const query = 'SELECT abr_as00, dir_as00, cta_as00, equ_as00, tit_as00, reg_as00 FROM lpb_as00 WHERE dir_as00 = ?'
                    equipos = await consultaMySql(query, [direc]); 
                    console.log(equipos.length, 'cantidad de equipos')
                    if(equipos.length === 0) throw error

                    await setEquipos(equipos)                  
                    
                    //generar reclamo aca en empresa incast
                    if(nombreEmp === 'Demo'){
                        let eqEnDByReclamo = await getEquipos()
                        const equipoR = eqEnDByReclamo[1].equipoR.includes('SAR') ? 'SAR' : eqEnDByReclamo[1].equipoR
                        //si el equipo no existe en el edificio no se genera la orden                        
                        if(!eqEnDByReclamo[0].equiposDB.includes(equipoR)){

                        await finalizarConversacion(numero);
                        return gotoFlow(flowEquipo)
                        }else{
                            console.log('se genera en el segundo 2222222222222')
                            await generarReclamo(numero, dataReclamo)
                        }
                    }    
                    //
                    await finalizarConversacion(numero);
                    //
                    await subirNombreEdificio(direc)
                    //
                    confirmoFlow = true //cambia el valor de la variable que maneja el comienzo de la conversacion la cual se pone en valor false dentro del flowPreguntasFinales al finalizar las preguntas
                    if(dataReclamo.Mo.includes('encerrado') || dataReclamo.Mo.includes('encerrada')){
                        
                        if(dataReclamo.Eq.toUpperCase().includes('ASC') || dataReclamo.Eq.toUpperCase().includes('MONTA')){
                            await flowDynamic([
                                {
                                    body: `✅ El ${dataReclamo.Eq.replace(/\.$/, '')} es un lugar seguro y con suficiente ventilación. 🚫 No intentes salir por tus propios medios ni tampoco deben intentar ayudarte desde afuera. 🙏 Aguarda por favor la llegada del técnico.`,
                                    delay: 2000,
                                }
                            ])
                        }
                    }
                    return gotoFlow(flowEquipo)
                } catch (error) {
                    await finalizarConversacion(numero);
                    logger.error('Error en la consulta MySQL en flowInicio.js:', error);
                    equipos = ['Direccion incorrecta'] // Reiniciar equipos si hay un error en la consulta
                    return gotoFlow(flowEquipo)
                }
            }
            end(endFlow, numero, gotoFlow)//finaliza la conversacion
            fallBack('')
        }
    })
    
const setConfirmoFlow = (value) => {
    confirmoFlow = value
}
const getConfirmoFlow =()=>{
    return confirmoFlow
}
const setVerificar =(value)=>{
    verificar.num = value
}

const setEquipos = (value) => {
    if (!value || !Array.isArray(value) || !value.length) {
        equipos = [];
        return;
    }
    
    equipos = value.map(clasificarEquipo);
};

const setEquiposReclamo = (value) =>{
    dataReclamo = value
}

const getEquipos = () => {
    return [
        { equiposDB: equipos },
        { equipoR: dataReclamo.Eq ? dataReclamo.Eq.toUpperCase().replace(/\.$/, '') : 'Sin Equipo' }
    ];
};
   

export { flowInicio, getEquipos, setConfirmoFlow, setEquipos, getConfirmoFlow, setEquiposReclamo, setVerificar };