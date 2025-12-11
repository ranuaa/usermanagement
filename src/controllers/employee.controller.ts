import e, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user.model";
import { Employee } from "../models/employee.model";
import { sequelize } from "../config/config";
import { capitalizeName, getAuthUser, isValidEmail } from "../midleware/helper";
import { UniqueConstraintError, ValidationError } from "sequelize";
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
  } catch (error : unknown) {
    await trans.rollback();
    if (error instanceof UniqueConstraintError) {
    const message = error.errors?.[0]?.message ?? "Duplicate value";
    return res.status(409).json({ message });
  }

  if (error instanceof ValidationError) {
    const message = error.errors?.[0]?.message ?? "Validation error";
    return res.status(400).json({ message });
  }

  const message = error instanceof Error ? error.message : "Internal Server Error";
  return res.status(500).json({ message });
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

  if (!userId) return res.status(400).json({ message: "userId param is required" });

  try {
    const body = req.body as any;


    let hashedPassword: string | undefined = undefined;
    if (body.password !== undefined && String(body.password).trim() !== "") {
      hashedPassword = await bcrypt.hash(String(body.password), 10);
    }

    await sequelize.transaction(async (t) => {

      const user = await User.findOne({
        where: { id: userId },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!user) {

        const err: any = new Error("User not found");
        err.status = 404;
        throw err;
      }

      const employee = await Employee.findOne({
        where: { userId },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!employee) {
        const err: any = new Error("User details not found");
        err.status = 404;
        throw err;
      }


      if (body.name !== undefined) {
        const formatted = capitalizeName(String(body.name));
        user.name = formatted;
        employee.fullName = formatted;
      }

      if (body.email !== undefined) {
        if (isValidEmail(body.email) === false) {
          const err: any = new Error("Invalid email format");
          err.status = 400;
          throw err;
        }

        const isEmailExist = await User.findOne({
          where: { email: body.email },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (isEmailExist && isEmailExist.id !== userId) {
          const err: any = new Error("Email already in use");
          err.status = 400;
          throw err;
        }

        user.email = body.email;
        employee.email = body.email;
      }

      employee.updatedBy = authUser.userName;

      if (hashedPassword) {
        user.password = hashedPassword;
      }

      if (body.role !== undefined) {
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


      if (body.dateOfJoining !== undefined) {
        if (body.dateOfJoining === null || String(body.dateOfJoining).trim() === "") {
          employee.dateOfJoining = null as any; 
        } else {
          const d = new Date(body.dateOfJoining);
          if (isNaN(d.getTime())) {
            const err: any = new Error("Invalid dateOfJoining");
            err.status = 400;
            throw err;
          }
          employee.dateOfJoining = d as any;
        }
      }

      if (body.dateOfBirth !== undefined) {
        if (body.dateOfBirth === null || String(body.dateOfBirth).trim() === "") {
          employee.dateOfBirth = null as any; 
        } else {
          const d = new Date(body.dateOfBirth);
          if (isNaN(d.getTime())) {
            const err: any = new Error("Invalid dateOfBirth");
            err.status = 400;
            throw err;
          }
          employee.dateOfBirth = d as any;
        }
      }

      await user.save({ transaction: t });
      await employee.save({ transaction: t });
    });

    return res.status(200).json({ message: "Employee updated successfully" });
  } catch (error: any) {
    const status = error?.status || 500;
    return res.status(status).json({ message: error?.message || "Internal Server Error", error });
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