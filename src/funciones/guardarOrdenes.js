//import postRevisarOrden from "../Fetch/postRevisarOrden.js"
import nombreEmpresa from "../Utils/nombreEmpresa.js"
import consultaMySql from "../Utils/consultaMySql.js"

let ordenes = []

async function guardarOrdenes() {
    let nombreEmp = await nombreEmpresa()
    try {
        const query = `SELECT reg_cl12, r00_cl12, tre_cl12, fec_cl12, hor_cl12, emp_cl12, dom_cl12, tte_cl12 
                        FROM lpb_cl12 
                        WHERE emp_cl12 = ? AND (r00_cl12 = 0 OR r00_cl12 = 1 OR r00_cl12 = 2 OR r00_cl12 = 3)
                        ORDER BY reg_cl12 DESC LIMIT 15`

        const rows = await consultaMySql(query, [nombreEmp])
        if (Array.isArray(rows)) {
            ordenes = rows
        } else {
            ordenes = [rows]
        }

        return ordenes
    } catch (err) {
        console.error('error al obtener ordenes: ', err)
    }
}
const getOrdenes = () => {
    return ordenes
}

export { guardarOrdenes, getOrdenes }