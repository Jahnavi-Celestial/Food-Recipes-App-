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
    @Column({type: "number"})
    recipe_id!: number

    @Field(()=>Date)
    @Column({type: "timestamp", default: ()=> "CURRENT_TIMESTAMP"})
    created_at?: Date;

    @Field(()=>Number, {nullable: true})
    @Column({type: "number", nullable: true})
    note_id!: number

    @ManyToMany(()=>Recipe, recipe=>recipe.ingredients, {cascade: true, eager: true})
    recipe!: Recipe

}