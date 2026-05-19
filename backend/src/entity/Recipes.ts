import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ManyToOne } from "typeorm";
import { User } from "./User.ts";
import {ObjectType, Field, ID,Int} from "type-graphql";
import { Ingredient } from "./Ingredient.ts";
import { Tag } from "./Tag.ts";
import { SavedRecipe } from "./SavedRecipe.ts";

@ObjectType()
@Entity("recipes")
export class Recipe{
    @Field(()=>ID)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(()=>String)
    @Column({type: "text"})
    title!: string;

    @Field(()=>String, {nullable: true})
    @Column({type: "text", nullable: true})
    description!: string;

    @Field(()=>Int, {nullable: true})
    @Column({name: "cooking_time", type: "int", nullable: true})
    cooking_time?: number;

    @Field(()=>String, {nullable: true})
    @Column({type: "text", nullable: true})
    image?: string;

    @Field(()=>Boolean)
    @Column({name: "is_public", type: "boolean", default: true})
    is_public!: boolean;
    
    @Column({name: "user_id", type: "int"})
    user_id!: number;

    @Field(()=>Date)
    @Column({type: "timestamp", default: ()=> "CURRENT_TIMESTAMP"})
    created_at?: Date;

    @Field(()=>Date)
    @Column({type: "timestamp", default: ()=> "CURRENT_TIMESTAMP"})
    updated_at?: Date;

    @ManyToOne(()=>User, user=>user.recipes)
    @JoinColumn({name: "user_id"})
    user!: User;

    @Field(() => [Ingredient], {nullable: true})
    @OneToMany(()=>Ingredient, ing => ing.recipe)
    ingredients!: Ingredient[]

    @Field(() => [Tag])
    @ManyToMany(()=>Tag, {cascade: true})
    @JoinTable({name : "recipe_tags"})
    tags!: Tag[]

    @OneToMany(()=>SavedRecipe, sr=>sr.recipe, {cascade: true, eager: true})
    savedBy!: SavedRecipe[]
}