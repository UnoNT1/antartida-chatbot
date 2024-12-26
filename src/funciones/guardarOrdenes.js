//import postRevisarOrden from "../Fetch/postRevisarOrden.js"
import conn from "../conexion.js"
import nombreEmpresa from "../Utils/nombreEmpresa.js"

let nombreEmp = await nombreEmpresa()
let ordenes = [
]

async function guardarOrdenes(){
    try{
        const query = `SELECT reg_cl12, r00_cl12, tre_cl12, fec_cl12, hor_cl12, emp_cl12 
                        FROM lpb_cl12 
                        WHERE emp_cl12 = ? AND (r00_cl12 = 0 OR r00_cl12 = 1 OR r00_cl12 = 3)
                        ORDER BY fec_cl12 desc limit 15`
                        
                        conn.query(query, [nombreEmp], async (err, rows) => {
                            if(err){
                                console.error('error al obtener ordenes: ', err)
                                return
                            }
            ordenes = rows
        })
        console.log(ordenes, ' ordenes de mysql ')
        return ordenes
    } catch (err){
        console.error('error al guardar orden: ', err)
        throw err
    }
}

const getOrdenes = () => {
    return ordenes
}

export { guardarOrdenes, getOrdenes }