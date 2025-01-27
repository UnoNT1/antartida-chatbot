import mysql from 'mysql2'
import dotenv from 'dotenv'

dotenv.config()

const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
})

conn.connect((err) => {
    if (err) {
        console.log(process.env.DB_NAME)
        console.error('Error al conectar con DB:', err)
        return
    } else {
        console.log('Conexion a la BD exitosa!!')
    }
})

export default conn

