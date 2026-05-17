import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL || "",
    entities: ["src/entity/*.ts"],
    migrations: ["../src/migrations/*.ts"]
})

try{
    await AppDataSource.initialize();
    console.log("Connected to database")
}catch(error:any){
    console.log("Error connecting to database", error.message);
}