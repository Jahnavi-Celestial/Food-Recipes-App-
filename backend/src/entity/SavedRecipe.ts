import { Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.ts";
import { Recipe } from "./Recipes.ts";


@ObjectType()
@Entity("saved_recipes")
export class SavedRecipe{
    @Field(()=>ID)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(()=>Number)
    @Column({type: "number"})
    user_id!: number

    @Field(()=>Number)
    @Column({type: "number"})
    recipe_id!: number

    @Field(()=>Date)
    @Column({type: "timestamp", default: ()=> "CURRENT_TIMESTAMP"})
    created_at?: Date;

    @ManyToOne(()=>User, user=>user.savedRecipes, {cascade: true, eager: true, onDelete: "CASCADE"})
    user!: User 

    @ManyToOne(()=>Recipe, recipe=>recipe.savedBy, {cascade: true, eager: true, onDelete: 'CASCADE'})
    recipe!: Recipe 
}