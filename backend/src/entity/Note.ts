import { Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


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
    @Column({type: "number"})
    user_id!: number;

    @Field(()=>Number)
    @Column({type: "number"})
    recipe_id!: number;
}