import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const createDatabaseIfNotExists = async () => {

    const dbName = process.env.DB_NAME;

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        port: Number(process.env.DB_PORT),
        multipleStatements: false,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    await connection.end();
}
