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
//import copiaConv from '../funciones/copiaConv.js'
import armarPrompt from '../Utils/armarPromptIncast.js' //IMPORTANTE: Cambiar dependiendo la empresa que se use. Si es Demo, usar armarPromptDemo.js, si es Incast usar armarPromptIncast.js
import { getContieneDatos } from './flowVerificarInicio.js'
import flowFin from './flowFin.js'
import confirmarReclamo from '../funciones/confirmarReclamo.js'

let dataReclamo = {}
let equipos = []
let verificar = {
    conf : false,//esta variable sirve para que el flujo no empiece de cero en otra parte de la conversacion. Pasaba que al enviar dos mensajes seguidos en el flow de preguntasFinales, volvia a arrancar el flujo desde el inicio.
    num : ''
}
let enviado; // Variable para controlar el envío del mensaje de aviso de fin de la conversación a los 8 minutos


const flowInicio = addKeyword(EVENTS.ACTION)
    .addAction(
        null,
        async (ctx, { flowDynamic, endFlow, gotoFlow }) => {
            let numero = ctx.from
            let mensaje = ctx.body.toLowerCase()
            setEnviado(false)
            //await finalizarConversacion('1');
            if(verificar.num !== numero){
                verificar.conf = false
                setNroOrden('')
                //copiaConv(numero)
            }
            verificar.num = numero //actualiza el numero de usuario actual
            
            if(verificar.conf){
                return gotoFlow(flowFin)
            }else {
                const nombreEmp = await nombreEmpresa()
                await flowDynamic([{ body: `Muchas gracias por comunicarse con Ascensores ${nombreEmp}.`, delay: 1000 }])
                //
            console.log('primer action')
                const contieneDatos = await getContieneDatos()
                const prompt = contieneDatos === true ? await getPrompt(nombreEmp, '2'): await armarPrompt(mensaje, numero);//IMPORTANTE: Cambiar en la importacion de este script dependiendo la empresa que se use. Si es Demo, usar armarPromptDemo.js, si es Incast usar armarPromptIncast.js
                const convGPT = await mensajeChatGPT(mensaje, prompt, numero)
                await flowDynamic([{ body: convGPT }])
                
                confirmarReclamo(mensaje, convGPT) //llama a la funcion que confirma el reclamo, si no se confirma no se genera el reclamo

                end(endFlow, numero, gotoFlow)//finaliza la conversacion
            }

    })
    .addAction(
        { capture: true },
        async (ctx, { flowDynamic, fallBack, gotoFlow, endFlow }) => {
            let numero = ctx.from
            let mensaje = ctx.body.toLowerCase()
            const nombreEmp = await nombreEmpresa()
            let prompt = ''
            
            if(verificar.conf){
                return
            } else {
                //
            console.log('segundo action')
                
                const contieneDatos = await getContieneDatos()
                const prompt = contieneDatos === true ? await getPrompt(nombreEmp, '2'): await armarPrompt(mensaje, numero);
                //console.log(prompt)
                const convGPT = await mensajeChatGPT(mensaje, prompt, numero)  
                await flowDynamic([{ body: convGPT }])

                const respuesta = await confirmarReclamo(mensaje, convGPT) //llama a la funcion que confirma el reclamo, si no se confirma no se genera el reclamo


                //Genera el reclamo y toma los datos del reclamo
                //variables para comprobar si la I.A. confirma el reclamo
                const motivo = respuesta?.includes('Motivo del reclamo') 
                const direccion = respuesta?.includes('Dirección') || convGPT?.includes('dirección')
                const edificio = respuesta?.includes('Edificio') || convGPT?.includes('edificio') 
                const equipo = respuesta?.includes('Equipo')
                if (motivo && direccion && edificio && equipo) {
                    dataReclamo = tomarDatosReclamo(respuesta) //obtiene los data:
                    /*{
                        'Mo': 'Ascensor, Montavehículo, SAR con problemas',
                        'Di': 'Jujuy 8',
                        Ed: 'EDIFICIO NARITA IV',
                        Eq: 'Ascensor'
                    }*/

                    if(nombreEmp !== 'Incast'){
                        await generarReclamo(numero, dataReclamo)
                    }	
                    const direc = dataReclamo.Di.toUpperCase().replace(/\.$/, '').trim(); //elimina el punto final y saca espacios
                    
                    try {
                        const query = 'SELECT abr_as00, dir_as00, cta_as00, equ_as00, tit_as00, reg_as00 FROM lpb_as00 WHERE dir_as00 = ?'
                        equipos = await consultaMySql(query, [direc]); 

                        if(equipos.length === 0) throw error
                        await setEquipos(equipos)                  
                        
                        //generar reclamo aca en empresa incast
                        if(nombreEmp === 'Incast'){
                            let eqEnDByReclamo = await getEquipos()
                            const equipoR = eqEnDByReclamo[1].equipoR.includes('SAR') ? 'SAR' : eqEnDByReclamo[1].equipoR
                            //si el equipo no existe en el edificio no se genera la orden                        
                            if(!eqEnDByReclamo[0].equiposDB.includes(equipoR)){
                                await finalizarConversacion(numero);
                                return gotoFlow(flowEquipo)
                            }else{
                                await generarReclamo(numero, dataReclamo)
                            }
                        }    
                        //
                        await finalizarConversacion(numero);
                        //
                        await subirNombreEdificio(direc)
                        //
                        setConfirmoFlow(true) //cambia el valor de la variable que maneja el comienzo de la conversacion la cual se pone en valor false dentro del flowPreguntasFinales al finalizar las preguntas
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
    verificar.conf = value
}
const getConfirmoFlow =()=>{
    return verificar.conf
}
/*const setVerificar =(value)=>{
    verificar.num = value
}*/

const setEquipos = (value) => {
    if (!value || !Array.isArray(value) || !value.length) {
        equipos = [];
        return;
    }
    
    equipos = value.map(clasificarEquipo);
};

/*
const setEquiposReclamo = (value) =>{
    dataReclamo = value
}*/

const getEquipos = () => {
    return [
        { equiposDB: equipos },
        { equipoR: dataReclamo.Eq ? dataReclamo.Eq.toUpperCase().replace(/\.$/, '') : 'Sin Equipo' }
    ];
};

const setEnviado = (value) => { //estos set y get se utilizan en la funcion avisarFin.js dentro de la funcion end()
    enviado = value;
}
const getEnviado = () => {
    return enviado;
}

export { flowInicio, getEquipos, setConfirmoFlow, setEquipos, getConfirmoFlow, setEnviado, getEnviado };