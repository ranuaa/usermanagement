import { Router } from "express";
import { createUser, getUserById, getAllUsers } from "../controllers/user.controller";
import { authMiddleware, roleGuard } from "../midleware/auth.middleware";

const router = Router();
router.post("/register", createUser);

router.get("/:userId",authMiddleware, getUserById);
router.get("/",
    authMiddleware,
    roleGuard(["admin", "hr", "manager"]),
    getAllUsers);

export default router;