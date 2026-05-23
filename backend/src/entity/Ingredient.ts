import { Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RecipeIngredient } from "./RecipeIngredient.ts";


@ObjectType()
@Entity("ingredients")
export class Ingredient{
    @Field(()=> ID)
    @PrimaryGeneratedColumn()
    id!: number

    @Field(()=>String)
    @Column({type: "text", unique: true})
    name!: string

    @Field(() => Date)
    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    created_at!: Date;

    @Field(()=> [RecipeIngredient])
    @OneToMany(() => RecipeIngredient, ri => ri.ingredient)
    recipeIngredients!: RecipeIngredient[];
}