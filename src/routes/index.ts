import { Router } from "express";
import login from "./login.route";
import uerRoute from "./user.route";
import employeeRoute from "./employee.route";

const router = Router();

router.use("/auth", login);
router.use("/user", uerRoute);
router.use("/employee", employeeRoute);

export default router;