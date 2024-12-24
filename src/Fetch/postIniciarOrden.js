import separarNumOrden from "../funciones/separarNumOrden.js";
import separarNumTecnicos from "../funciones/separarNumTecnicos.js";
import armarURL from "../funciones/armarNumURL.js";

//hace un post con los datos del mensaje y devuelve los numero de los tecnicos
let numOrden
let url

async function postIniciarOrden(objeto) {
    let numTecnicos
    try {
        const response = await fetch('https://www.unont.com.ar/yavoy/sistemas/dato5/android/w_sms.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(objeto)
        });

        if (!response.ok) {
            throw new Error('Error en el request a la red: ' + response.statusText);
        }

        //esta es la respuesta que obtengo del backend   === response.text()  
        //{"status":"success","message":"Datos recibidos correctamente"}  response aca  [["37095*80070204*#03516674325#03515394961#0351-155214053#03516646898#03516646896#"]] 

        const text = await response.text();
        
        numOrden = separarNumOrden(text)//toma el numero de orden
        url = armarURL(text, numOrden)//arma la url para enviar en el mensaje
        
        numTecnicos = separarNumTecnicos(text);//toma los numeros de los tecnicos
        console.log('Iniciar Orden --- Numeros orden:', numOrden, 'Url: ', url);

        return numTecnicos
    } catch (error) {
        console.error('Hubo un problema con la solicitud Fetch(POST) al backend:', error);
        throw error;
    }
}

const getUrl = () => {
    return url
}

export { postIniciarOrden, getUrl };