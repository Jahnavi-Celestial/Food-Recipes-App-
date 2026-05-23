import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ManyToOne } from "typeorm";
import { User } from "./User.ts";
import {ObjectType, Field, ID,Int} from "type-graphql";
import { Tag } from "./Tag.ts";
import { SavedRecipe } from "./SavedRecipe.ts";
import { RecipeIngredient } from "./RecipeIngredient.ts";

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

    @ManyToOne(()=>User, user=>user.recipe)
    @JoinColumn({name: "user_id"})
    user!: User;

    @Field(()=>[RecipeIngredient])
    @OneToMany(() => RecipeIngredient, ri => ri.recipe,{cascade: true, eager: true})
    ingredients!: RecipeIngredient[]

    @Field(() => [Tag])
    @ManyToMany(()=>Tag, {cascade: true, eager: true})
    @JoinTable({name : "recipe_tags",
        joinColumn:{
            name: "recipe_id",
            referencedColumnName: "id",
        },
        inverseJoinColumn:{
            name: "tag_id",
            referencedColumnName: "id"
        }
    })
    tags!: Tag[]

    @Field(()=>[SavedRecipe], {nullable: true})
    @OneToMany(()=>SavedRecipe, sr=>sr.recipe)
    savedBy!: SavedRecipe[]
}