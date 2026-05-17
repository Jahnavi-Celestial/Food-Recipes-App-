import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/db.ts";
import { User } from "../entity/User.ts";
import dotenv from "dotenv";

dotenv.config();

export async function register(req: Request,res: Response){
   try{
     const {name, email, password} = req.body 

    const userRepo = AppDataSource.getRepository(User);

    const isEmailExist = await userRepo.findOne({where: {email: email}});

    if(isEmailExist){
        return res.json({message: "User already exist"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await userRepo.insert({name, email, password: hashedPassword});

    return res.json({message: "User registered successfully"});
   }
   catch(error: any){
    res.json({error: error.message})
   }
}

export async function login(req: Request,res: Response){
    try{
        const {email, password} = req.body;

    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({where: {email: email}});

    if(!user){
        return res.json({message: "User not exist"})
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
        return res.json({message: "Invalid email or password"})
    }

    const token = jwt.sign(
        {userId: user.id},
        process.env.JWT_SECRET as string,
        {expiresIn: "1h"}
    )

     return res.json({message: "User login successfully", token: token})
    }
    catch(error:any){
        res.json({error: error.message})
    }
}