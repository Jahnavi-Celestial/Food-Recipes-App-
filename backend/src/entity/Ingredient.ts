import { Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Recipe } from "./Recipes.ts";


@ObjectType()
@Entity("ingredients")
export class Ingredient{
    @Field(()=> ID)
    @PrimaryGeneratedColumn()
    id!: number

    @Field(()=>String)
    @Column({type: "text"})
    name!: string

    @Field(()=>Number)
    @Column({type: "int"})
    recipe_id!: number

    @ManyToMany(()=>Recipe, recipe=>recipe.ingredients, {cascade: true, eager: true})
    recipe!: Recipe

}