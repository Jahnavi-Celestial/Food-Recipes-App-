import { Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity("recipe_tags")
export class RecipeTags {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => Number)
    @Column({ type: "int" })
    tag_id!: number;

    @Field(() => Number)
    @Column({ type: "int" })
    recipe_id!: number;
}