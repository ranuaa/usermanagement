import { Request, Response, NextFunction } from "express";
import jwt, {JwtPayload} from "jsonwebtoken";

export type jwtPayload = JwtPayload & {id : string, email: string, role: string, userName: string};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if(!header?.startsWith("Bearer ")) return res.status(401).json({message: "Unauthorized"});

    const token = header.slice(7);

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET as string) as jwtPayload;
        (req as any).user = payload;
        next();
    } 
    catch (error) {
        return res.status(401).json({message: "Invalid Token"});
    }
};

export const roleGuard = (roles: string[]) => {
    const allowed = roles.map(r => r.toLowerCase());
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user as {role? : string} | undefined;
          const role = (user?.role ?? "").toLowerCase();

        if(!allowed.includes(role)){
            return res.status(403).json({message: "Forbidden"});
        }
        next();
    };
};
