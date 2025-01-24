import conn from "../conexion.js"

async function consultaMySql(query, values){
    const response = await new Promise((resolve, reject) => {
        conn.query(query, values, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });

    return response
}


export default consultaMySql;