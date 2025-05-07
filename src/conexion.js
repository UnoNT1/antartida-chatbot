import mysql from 'mysql2'
import dotenv from 'dotenv'

dotenv.config()

const conn = mysql.createPool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0
})


export default conn

