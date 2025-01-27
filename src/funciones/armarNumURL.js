//recibe como texto la respuesta del postAlBackend al enviar un mensaje y separa el num de la url

//{"status":"success","message":"Datos: "} '[["37390*80070258*#03516674325#03515394961#0351-155214053#03516646898#03516646896#"]]'

function armarURL(data, numOrden) {
    const dataStart = data.indexOf('[');
    const dataEnd = data.lastIndexOf(']') + 1;
    const dataString = data.slice(dataStart, dataEnd);

    const subcadenas = dataString.split('#')
    let resultado = subcadenas.filter(subcadena => subcadena !== '');

    const numStart = resultado[0].indexOf('*') + 1
    const numEnd = resultado[0].lastIndexOf('*')
    const numUrl = resultado[0].slice(numStart, numEnd)


    let url = `http://www.unont.com.ar/yavoy/formato.php?r=${numUrl}&n=${numOrden}&t=10`

    return url
}

export default armarURL