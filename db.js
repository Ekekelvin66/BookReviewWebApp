import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config();

export const db = new pg.Pool({
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    host:process.env.DB_HOST,
    port:Number(process.env.DB_PORT),
});
db.connect();

