import { Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
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

    @ManyToOne(()=>Recipe, recipe=>recipe.ingredients, {onDelete: "CASCADE"})
    @JoinColumn({name: "recipe_id"})
    recipe!: Recipe

}