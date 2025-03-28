import conn from "../conexion.js"

async function consultaMySql(query, values) {
    console.log('query', query)
    console.log('values', values)
    const response = await new Promise((resolve, reject) => {
        conn.query(query, values, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
    console.log('response', response)

    return response
}


export default consultaMySql;