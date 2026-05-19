import { Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Recipe } from "./Recipes.ts";


@ObjectType()
@Entity("tags")
export class Tag{
    @Field(()=> ID)
    @PrimaryGeneratedColumn()
    id!: number

    @Field(()=>String)
    @Column({type: "text", unique: true})
    name!: string

    @ManyToMany(()=>Recipe, recipe=>recipe.tags, {eager: true})
    recipes!: Recipe[]
}