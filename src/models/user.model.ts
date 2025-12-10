import {Table, Column, Model, DataType, AllowNull, Unique, Default, PrimaryKey} from 'sequelize-typescript';

import { InferAttributes, CreationOptional, InferCreationAttributes } from 'sequelize';

@Table({tableName: "users", timestamps: true})
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>>  {

    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column({type: DataType.UUID})
    declare id: CreationOptional<string>;

    @AllowNull(false)
    @Column({type: DataType.STRING})
    declare name: string;

    @AllowNull(false)
    @Unique(true)
    @Column({type: DataType.STRING})
    declare email: string;

    @AllowNull(false)
    @Column({type: DataType.STRING})
    declare password: string;

    @Default("User")
    @AllowNull(false)
    @Column({type: DataType.STRING})
    declare role: string;
}
    