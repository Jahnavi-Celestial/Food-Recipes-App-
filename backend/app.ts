import "reflect-metadata";
import express from "express";
import dotenv from "dotenv"
import { authRouter } from "./src/routes/authRoutes.ts";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/auth", authRouter)

const PORT = process.env.PORT;
app.listen(PORT, ()=>{
    console.log(`Server running at http://localhost:${PORT}`)
})