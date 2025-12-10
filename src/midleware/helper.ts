import { Request } from "express";
import { jwtPayload } from "./auth.middleware";


export const  capitalizeName = (input: string) => {
  return input
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


export const getAuthUser = (req: Request) => {
  return (req as any).user as jwtPayload;
};