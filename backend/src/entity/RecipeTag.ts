import { Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@ObjectType()
@Entity("recipe_tags")
export class RecipeTags{
    @Field(()=> ID)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(()=>Number)
    @Column({type: "number"})
    tag_id!: number;

    @Field(()=>Number)
    @Column({type: "number"})
    recipe_id!: number;
}