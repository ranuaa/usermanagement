import {Table, Column, Model, DataType,Unique, Default, AllowNull, PrimaryKey, ForeignKey, BelongsTo} from 'sequelize-typescript';
import { User } from './user.model';
import {  InferAttributes, InferCreationAttributes,CreationOptional  } from 'sequelize';

@Table({tableName: "employees", timestamps: true})

export class Employee extends Model<InferAttributes<Employee>, InferCreationAttributes<Employee>>  {
  @PrimaryKey
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  declare userId: string;

  @BelongsTo(() => User,  { onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: "userId"  })
  declare user?: User;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  declare fullName: string;

  @AllowNull(false)
  @Unique(true)
  @Column({ type: DataType.STRING })
  declare email: string;

  @AllowNull(true)
  @Unique(true)
  @Column({ type: DataType.STRING })
  declare phoneNumber: CreationOptional <string>;

  @AllowNull(true)
  @Default("-")
  @Column({ type: DataType.STRING })
  declare address: CreationOptional <string>;

  @AllowNull(true)
  @Default("-")
  @Column({ type: DataType.STRING })
  declare department : CreationOptional <string>;

  @AllowNull(true)
  @Default("-")
  @Column({ type: DataType.STRING })
  declare jobTitle : CreationOptional <string>;

  @AllowNull(true)
  @Default("-")
  @Column({ type: DataType.STRING })
  declare salary : CreationOptional <string>;

  @AllowNull(true)
  @Default(0)
  @Column({ type: DataType.INTEGER })
  declare leaveAllowance?: CreationOptional <number>;

  @AllowNull(true)
  @Default("-")
  @Column({ type: DataType.STRING })
  declare workLocation : CreationOptional <string>;

  @AllowNull(true)
  @Default("-")
  @Column({ type: DataType.STRING })
  declare businessAddress : CreationOptional <string>;

  @AllowNull(true)
  @Default("-")
  @Column({ type: DataType.STRING })
  declare photoUrl : CreationOptional <string>;

  @AllowNull(true)
  @Default("-")
  @Column({ type: DataType.STRING })
  declare emergencyContact : CreationOptional <string>;

  @AllowNull(true)
  @Default("-")
  @Column({ type: DataType.STRING })
  declare createdBy : CreationOptional <string>;

  @AllowNull(true)
  @Default("-")
  @Column({ type: DataType.STRING })
  declare updatedBy : CreationOptional <string>;

  @AllowNull(true)
  @Default("-")
  @Column({ type: DataType.STRING })
  declare status : CreationOptional <string>;

  @AllowNull(false)
  @Default(Date.now)
  @Column({ type: DataType.DATE })
  declare dateOfJoining : CreationOptional <Date>;

  @AllowNull(true)
  @Column({ type: DataType.DATE })
  declare dateOfBirth : CreationOptional <Date | null>;

  @AllowNull(true)
  @Default("-")
  @Column({ type: DataType.STRING })
  declare gender : CreationOptional <string>;

  @AllowNull(true)
  @Default("-")
  @Column({ type: DataType.STRING })
  declare reportingTo : CreationOptional <string>;
}