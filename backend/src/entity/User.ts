import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import {ObjectType, Field, ID} from "type-graphql";
import { SavedRecipe } from "./SavedRecipe.ts";
import { Recipe } from "./Recipes.ts";

@ObjectType()
@Entity("users")
export class User {
    @Field(()=>ID)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(()=>String)
    @Column({type: "text"})
    name!: string;

    @Field(()=>String)
    @Column({type: "text", unique: true})
    email!: string;

    @Column({type: "text", nullable: true})
    password!: string;

    @Column({type: "text", nullable: true, unique: true})
    google_id!: string;

    @Field(()=>String,{nullable: true})
    @Column({type: "text", nullable: true})
    bio?: string;

    @Field(()=>String, {nullable: true})
    @Column({type: "text", nullable: true})
    profile_img?: string;

    @Field(()=>String, {nullable: true})
    @Column({type: "text", nullable: true})
    contact_no?: string;

    @Field(()=>Date)
    @Column({type: "timestamp", default: ()=> "CURRENT_TIMESTAMP"})
    created_at?: Date;

    @Field(()=>Date)
    @Column({type: "timestamp", default: ()=> "CURRENT_TIMESTAMP"})
    updated_at?: Date;

    @OneToMany(()=> Recipe, recipe => recipe.user, {cascade: true, eager: true})
    recipe!: Recipe[]

    @OneToMany(()=> SavedRecipe, sr => sr.user, {cascade: true, eager: true})
    savedRecipes!: SavedRecipe[]
}