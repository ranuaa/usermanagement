import e, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user.model";
import { Employee } from "../models/employee.model";
import { sequelize } from "../config/config";
import { capitalizeName, getAuthUser, isValidEmail } from "../midleware/helper";
import path from "path";
import fs from "fs";

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await Employee.findOne({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  const trans = await sequelize.transaction();
  const userAuth = getAuthUser(req);

  try {
    const { name, email, password } = req.body as any;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    if (isValidEmail(email) === false) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const formatedName = capitalizeName(name);
    const exist = await User.findOne({ where: { email } });
    if (exist) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create(
      {
        name: formatedName,
        email,
        password: hashedPassword,
        role: req.body.role ?? "User",
      },
      { transaction: trans }
    );
    const newEmployee = await Employee.create(
      {
        userId: newUser.id,
        email: email,
        fullName: formatedName,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
        department: req.body.department,
        jobTitle: req.body.jobTitle,
        salary: req.body.salary,
        leaveAllowance: req.body.leaveAllowance,
        workLocation: req.body.workLocation,
        businessAddress: req.body.businessAddress,
        emergencyContact: req.body.emergencyContact,
        gender: req.body.gender,
        reportingTo: req.body.reportingTo,
        status: req.body.status,
        dateOfJoining: req.body.dateOfJoining
          ? new Date(req.body.dateOfJoining)
          : undefined,
        dateOfBirth: req.body.dateOfBirth
          ? new Date(req.body.dateOfBirth)
          : undefined,
        createdBy: req.body.createdBy ?? userAuth.userName,
      },
      { transaction: trans }
    );

    await trans.commit();

    return res.status(201).json({ message: "Employee created successfully" });
  } catch (error) {
    await trans.rollback();
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const uploadPhoto = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    console.log("Uploading photo for userId:", userId);
    const user = await Employee.findOne({ where: { userId } });


    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
        if (!user) {
        fs.unlink(req.file.path, () => {});
      return res.status(404).json({ message: "User not found" });
    }
    user.photoUrl = `/uploads/photos/${path.basename(req.file.path)}`;
    await user.save();
    return res.status(200).json({ message: "Photo uploaded successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const authUser = getAuthUser(req);
  if (!userId)
    return res.status(400).json({ message: "userId param is required" });

  const trans = await sequelize.transaction();

  try {
    const body = req.body as any;
    const user = await User.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });
    const employee = await Employee.findOne({ where: { userId } });
    if (!employee)
      return res.status(404).json({ message: "User details not found" });

    const formatedName = body.name ? capitalizeName(body.name) : undefined;

    if (body.name !== undefined) {
      const formatted = capitalizeName(String(body.name));
      user.name = formatted;
      employee.fullName = formatted;
    }

    if (body.email !== undefined) {
        if (isValidEmail(body.email) === false) {
            return res.status(400).json({ message: "Invalid email format" });
        }
    }

    const isEmailExist = await User.findOne({ where: { email: body.email } });
    if (isEmailExist && isEmailExist.id !== userId) {
        return res.status(400).json({ message: "Email already in use" });
    }

    user.email = body.email ?? user.email;
    employee.email = body.email ?? employee.email;
    employee.updatedBy = authUser.userName;

    if (body.password !== undefined) {
      const hashedPassword = await bcrypt.hash(body.password, 10);
      user.password = hashedPassword;
    }

    if(body.role !== undefined) {
      user.role = body.role;
    }

        const setIfProvided = <T>(key: keyof Employee, value: T | undefined) => {
      if (value !== undefined) (employee as any)[key] = value;
    };

    setIfProvided("phoneNumber", body.phoneNumber);
    setIfProvided("address", body.address);
    setIfProvided("department", body.department);
    setIfProvided("jobTitle", body.jobTitle);
    setIfProvided("salary", body.salary);
    setIfProvided("leaveAllowance", body.leaveAllowance);
    setIfProvided("workLocation", body.workLocation);
    setIfProvided("businessAddress", body.businessAddress);
    setIfProvided("emergencyContact", body.emergencyContact);
    setIfProvided("gender", body.gender);
    setIfProvided("reportingTo", body.reportingTo);
    setIfProvided("status", body.status);
    if (body.dateOfJoining !== undefined) employee.dateOfJoining = new Date(body.dateOfJoining);
    if (body.dateOfBirth !== undefined) employee.dateOfBirth = new Date(body.dateOfBirth);

    await user.save({ transaction: trans });
    await employee.save({ transaction: trans });
    await trans.commit();
    return res.status(200).json({ message: "Employee updated successfully" });

  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
    const userId = req.params.userId;
    if (!userId)
      return res.status(400).json({ message: "userId param is required" });
     const trans = await sequelize.transaction();
     let photoUrl: string | undefined;

     try{
        const employee =  await Employee.findOne({ where: { userId } });
        if(!employee) return res.status(404).json({ message: "Employee not found" });
        photoUrl = employee.photoUrl ?? undefined;
        await employee.destroy({ transaction: trans });
        const user = await User.findOne({ where: { id: userId } });
        if(user){
            await user.destroy({ transaction: trans });
        }

        await trans.commit();

        if(photoUrl && photoUrl.startsWith("/uploads/photos/")){
            const photoPath = path.join(process.cwd(), photoUrl.replace(/^\/+/,""));
            fs.unlink(photoPath, () => {});
        }

        return res.status(200).json({ message: "Employee deleted successfully" });
     }
     catch(error){
        trans.rollback();
        return res.status(500).json({ message: "Internal Server Error" });
     };
};