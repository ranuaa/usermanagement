import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

export const login = async (req: Request, res: Response) => {
    try {
    const { email, password } = req.body;
    console.log(req.body);
    const user = await User.findOne({ where: { email } });
    console.log("1")
    if (!user) return res.status(404).json({ message: "Invalid Credential / User Not Found" });
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ message: "Invalid Credential / User Not Found" });
    console.log("2")
    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, userName: user.name },
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
    );
    return res.status(200).json({  
        token,
        user: { name: user.name, role: user.role },
    })}
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}