import conn from "../conexion.js"
import logger from "./historico.js"
//FUNCION QUE REALIZA CONSULTAS A LA BASE DE DATOS MYSQL

async function consultaMySql(query, values) {

    try {
        const response = await new Promise((resolve, reject) => {
            conn.query(query, values, (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });
    
        return response
    } catch (error) {
        logger.error('Error en consultaMySql:', error);
        throw error; // Propaga el error para que pueda ser manejado por el llamador     
    }
}


export default consultaMySql;