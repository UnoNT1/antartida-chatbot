//recibe como texto la respuesta del postAlBackend al enviar un mensaje y separa el num de la url

import consultaMySql from "../Utils/consultaMySql.js";
import nombreEmpresa from "../Utils/nombreEmpresa.js";

//{"status":"success","message":"Datos: "} '[["37390*80070258*#03516674325#03515394961#0351-155214053#03516646898#03516646896#"]]'

async function armarURL(data, numOrden) {
    if(data.includes('[{"logstatus"') || data.includes('[["1*Se agrego el mensaje al reclamo')){
        return null
    }
    const nomEmp = await nombreEmpresa()
    const query = 'SELECT idu_fe00 FROM lpb_fe00 where ufe_fe00 = ?'
    let idEmp = await consultaMySql(query, [nomEmp])
    idEmp = idEmp[0].idu_fe00.toString()
    
    const dataStart = data.indexOf('[');
    const dataEnd = data.lastIndexOf(']') + 1;
    const dataString = data.slice(dataStart, dataEnd);

    const subcadenas = dataString.split('#')
    let resultado = subcadenas.filter(subcadena => subcadena !== '');

    const numStart = resultado[0].indexOf('*') + 1
    const numEnd = resultado[0].lastIndexOf('*')
    const numUrl = resultado[0].slice(numStart, numEnd)

    let url = `https://www.unont.com.ar/yavoy/formato.php?r=${numUrl}&n=${numOrden}&t=10&u=${idEmp}`

    return url
}

export default armarURL