import mysql from 'mysql2'
import dotenv from 'dotenv'

dotenv.config()

const conn = mysql.createPool({
    host: process.env.DB_HOST_2,
    database: process.env.DB_NAME_2,
    user: process.env.DB_USER_2,
    password: process.env.DB_PASSWORD_2,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0
})


export default conn

