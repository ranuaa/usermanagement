import { Router } from "express";
import { authMiddleware, roleGuard } from "../midleware/auth.middleware";
import { createEmployee, getUserById, uploadPhoto,updateEmployee, deleteEmployee } from "../controllers/employee.controller";
import { uploadEmployeePhoto } from "../midleware/photoUpload";

const router = Router();

router.post(
    "/createEmployee",
    authMiddleware,
    roleGuard(["admin", "hr", "manager"]),
    createEmployee
);

router.put(
    "/uploadPhoto/:userId",
    authMiddleware, 
    roleGuard(["admin", "hr", "manager"]),
    uploadEmployeePhoto.single("photo"), 
    uploadPhoto
);

router.put(
    "/updateEmployee/:userId",
    authMiddleware,
    roleGuard(["admin", "hr", "manager"]),
    updateEmployee
);

router.delete(
    "/deleteEmployee/:userId",
    authMiddleware,
    roleGuard(["admin", "hr", "manager"]),
    deleteEmployee
);
export default router;


