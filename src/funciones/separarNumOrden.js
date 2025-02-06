//tratando de separa el numero de orden no terminada
//Si se cambia el texto recibido del backend hay que modificar esta funcion
//asi recibe la respuesta del backend = '{"status":"success","message":"Datos recibidos correctamente"}  response aca  [["37095*80070204*#03516674325#03515394961#0351-155214053#03516646898#03516646896#"]]'

function separarNumOrden(data) {
    
    if(data.includes('"logstatus"') || data.includes('Se agrego el mensaje al reclamo')){
        return null
    }

    console.log(data, 'data en separarNumOrden')
    const dataStart = data.indexOf('[');
    const dataEnd = data.lastIndexOf(']') + 1;
    const dataString = data.slice(dataStart, dataEnd);

    const subcadenas = dataString.split('#')
    let resultado = subcadenas.filter(subcadena => subcadena !== '');
    const numStart = resultado[0].indexOf('"') + 1
    const numEnd = resultado[0].indexOf('*')
    const numOrden = resultado[0].slice(numStart, numEnd)

    return numOrden
}

export default separarNumOrden