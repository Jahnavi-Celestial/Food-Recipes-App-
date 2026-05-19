import { Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SavedRecipe } from "./SavedRecipe.ts";


@ObjectType()
@Entity("notes")
export class Note{
    @Field(()=> ID)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(()=>String, {nullable: true})
    @Column({type: "text", nullable: true})
    note!: string;

    @Field(()=>Number)
    @Column({type: "int"})
    saved_recipe_id!: number;

    @Field(()=>Date)
    @Column({type: "timestamp", default: ()=> "CURRENT_TIMESTAMP"})
    created_at!: Date;

    @Field(()=>[SavedRecipe])
    @ManyToOne(()=>SavedRecipe, (sr)=> sr.notes,{cascade: true, eager: true, onDelete: 'CASCADE'})
    saved_recipe!: SavedRecipe
}