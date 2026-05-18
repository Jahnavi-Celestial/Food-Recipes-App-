import jwt from "jsonwebtoken";
import type {Request, Response, NextFunction} from "express";

export interface AuthReq extends Request{
  userId?: number
}

export function authMiddleware(req: AuthReq, res: Response, next: NextFunction) {
  try {
    const token: string | undefined = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next();
    }

    const decoded: any = jwt.verify(token, String(process.env.JWT_SECRET));

    req.userId = decoded.userId;

    next()
  } catch (error: any) {
    return { error: error.message };
  }
}