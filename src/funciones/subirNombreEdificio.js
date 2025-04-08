import consultaMySql from '../Utils/consultaMySql.js'
import { getNroOrden } from '../Fetch/postIniciarOrden.js'
import nombreEmpresa from '../Utils/nombreEmpresa.js'   
///hace un update a la base de datos, columna donde se encuentra la orden generada, para cargar el nombre y la direccion del edificio
//UTILIZADO EN flowInicio.js
async function subirNombreEdificio(direccion){
    let nombreEmp = await nombreEmpresa()
    if(direccion){
        direccion = direccion.toUpperCase()
    }

    try {
        let orden = await getNroOrden()
        
        const queryDirFan = `SELECT tit_as00, dir_as00 FROM lpb_as00 WHERE emp_as00 = ? and dir_as00 = ?`
        const edificio = await consultaMySql(queryDirFan, [nombreEmp, direccion])
        
        console.log(orden, 'orden en subirNombreEdificio', direccion, 'direccion en subirNombreEdificio', '---------', edificio)
        const query = 'UPDATE lpb_cl12 SET dom_cl12 = ?, tit_cl12 = ? WHERE reg_cl12 = ?'

        await consultaMySql(query, [edificio[0].dir_as00, edificio[0].tit_as00, orden])
    }catch(err){
        console.error('No se pudo obtener y/o cargar la direccion y el nombre del edificio', err)
    }
}


export default subirNombreEdificio