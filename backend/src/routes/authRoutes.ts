import { Router } from "express";
import * as authController from "../controllers/authController.ts"

export const authRouter = Router();

authRouter.post("/register", authController.register);

authRouter.post("/login", authController.login);