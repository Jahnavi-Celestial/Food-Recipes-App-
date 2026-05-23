import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import { Field, ID, ObjectType, Float } from "type-graphql";
import { Recipe } from "./Recipes.ts";
import { Ingredient } from "./Ingredient.ts";

@ObjectType()
@Entity("recipe_ingredients")
export class RecipeIngredient {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => Float, { nullable: true })
    @Column({ type: "numeric", nullable: true })
    quantity?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: "text", nullable: true })
    unit?: string;

    @Field(() => Number)
    @Column({ type: "int" })
    recipe_id!: number;

    @Field(() => Number)
    @Column({ type: "int" })
    ingredient_id!: number;

    @Field(() => Recipe)
    @ManyToOne(() => Recipe, recipe => recipe.ingredients, { onDelete: "CASCADE" })
    @JoinColumn({ name: "recipe_id" })
    recipe!: Recipe;

    @Field(() => Ingredient)
    @ManyToOne(() => Ingredient, ingredient => ingredient.recipeIngredients, { eager: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "ingredient_id" })
    ingredient!: Ingredient;
}