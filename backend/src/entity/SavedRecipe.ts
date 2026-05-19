import { Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.ts";
import { Recipe } from "./Recipes.ts";
import { Note } from "./Note.ts";

@ObjectType()
@Entity("saved_recipes")
export class SavedRecipe{
    @Field(()=>ID)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(()=>Number)
    @Column({type: "int"})
    user_id!: number

    @Field(()=>Number)
    @Column({type: "int"})
    recipe_id!: number

    @Field(()=>Date)
    @Column({type: "timestamp", default: ()=> "CURRENT_TIMESTAMP"})
    created_at?: Date;

    @ManyToOne(()=>User, user=>user.savedRecipes, {onDelete: "CASCADE"})
    @JoinColumn({name: "user_id"})
    user!: User 

    @ManyToOne(()=>Recipe, recipe=>recipe.savedBy, {onDelete: 'CASCADE'})
    @JoinColumn({name: "recipe_id"})
    recipe!: Recipe 

    @OneToMany(()=>Note, (note)=>note.saved_recipe)
    notes!: Note[]
}