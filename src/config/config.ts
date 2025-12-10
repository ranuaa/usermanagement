import 'reflect-metadata';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../models/user.model';
import { Employee } from '../models/employee.model';

dotenv.config();

export const sequelize = new Sequelize({
    host: process.env.DB_HOST,
    username: process.env.DB_USER ,
    password: process.env.DB_PASS ,
    database: process.env.DB_NAME ,
    port: Number(process.env.DB_PORT),
    dialect: process.env.DB_DIALECT as any,
    logging: false,    
    models: [User, Employee],
});