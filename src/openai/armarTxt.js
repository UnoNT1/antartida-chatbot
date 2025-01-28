import conn from "../conexion.js";
import consultaMySql from "../Utils/consultaMySql.js";

function armarTxt() {
    const query = `SELECT * FROM usuarios`
    consultaMySql(query, conn)
}