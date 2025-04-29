import separarNumOrden from "../funciones/separarNumOrden.js";
import separarNumTecnicos from "../funciones/separarNumTecnicos.js";
import armarURL from "../funciones/armarNumURL.js";
import logger from "../Utils/historico.js";

//hace un post con los datos del mensaje y devuelve los numero de los tecnicos
let numOrden
let url

/*
[{"logstatus":"0*0"}]
[["1*Se agrego el mensaje al reclamo Nro 22384 *#"]]
[["22384*3789637*#351-2846597#351-3603694#"]]

[
  'El motivo detallado del reclamo es "se me cayeron las llaves al pozo",',
  'Dean Funes 1132.'
] aca el mensaje con la direccion en generarReclamo
{
  nrollamada: '5493516008817',
  mensaje: 'El motivo detallado del reclamo es "se me cayeron las llaves al pozo",',
  empresa: 'Incast',
  accion: '1',
  lugar: '0'
} objeto en postIniciarOrden
{"status":"success","message":"Datos recibidos correctamente"}  response aca  [{"logstatus":"0*0"}] respuesta orden creada en postIniciarOrden
{"status":"success","message":"Datos recibidos correctamente"}  response aca  [{"logstatus":"0*0"}]
Iniciar Orden --- Numeros orden: null Url:  null
null orden en subirNombreEdificio DEAN FUNES 1132. direccion en subirNombreEdificio --------- []

*/

async function postIniciarOrden(objeto) {
    let numTecnicos
    console.log(objeto, 'objeto en postIniciarOrden')
    try {
        const response = await fetch('https://unont.com.ar/yavoy/sistemas/dato5/android/w_sms.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(objeto)
        });
        if (!response.ok) {
            throw new Error('Error en el request a la red: ' + response.statusText);
        }

        /*esta es la respuesta que obtengo del backend   === response.text()
        {"status":"success","message":"Datos: "} [["37095*80070204*#03516674325#03515394961#0351-155214053#03516646898#03516646896#"]] */
        const text = await response.text();

        logger.log(text, 'respuesta orden creada en postIniciarOrden')
        numOrden = separarNumOrden(text)//toma el numero de orden
        url = armarURL(text, numOrden)//arma la url para enviar en el mensaje
        numTecnicos = separarNumTecnicos(text);//toma los numeros de los tecnicos
        logger.log('Iniciar Orden --- Numeros orden:', numOrden, 'Url: ', url);
        
        return numTecnicos
    } catch (error) {
        logger.error('Hubo un problema con la solicitud Fetch(POST) al backend:', error);
        throw error;
    }
}

const getUrl = () => {
    return url
}
const getNroOrden = () => {
    return numOrden
}
const setNroOrden = (nro) => {
    numOrden = nro
}

export { postIniciarOrden, getUrl, getNroOrden, setNroOrden };