import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user.model";
import { Employee } from "../models/employee.model";
import { sequelize } from "../config/config";
import { capitalizeName, getAuthUser } from "../midleware/helper";

export const getUserById = async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const authUser = getAuthUser(req);
    console.log(1)
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    if(authUser.id !== userId && authUser.role.toLowerCase() !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
    }

    try {
        console.log("data employee")
        const data = await Employee.findByPk(userId, {
            include: [{
                model: User,
                attributes: ["name", "email", "role"]
            },
        ],
        attributes: { exclude: ["createdAt", "updatedAt"] }
        });
        return res.status(200).json(data);
    }
    catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const createUser = async (req: Request, res: Response) => {
    const trans = await sequelize.transaction();
    
    try {
        const { name, email, password, user } = req.body as any;
        const formatedName  = capitalizeName(name);
        const exist = await User.findOne({ where: { email } });
        if (exist) return res.status(400).json({ message: "Email already in use" });
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name: formatedName,
            email,
            password: hashedPassword,
            role: "User"
        });

        const newEmployee = await Employee.create({
            fullName: formatedName,
            email,
            userId: newUser.id,
            createdBy: user ? user : name
        });
        await trans.commit();
        return res.status(201).json({ message: "User created successfully"});
    } catch (error) {
        await trans.rollback();
        return res.status(500).json({ message: "Internal Server Error", error });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
         const employees = await Employee.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name", "email", "role"], // exclude password
        },
      ],
      attributes: { exclude: ["createdAt", "updatedAt"] },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(employees);
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


