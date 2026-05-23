import { Field, Float, InputType } from "type-graphql";

@InputType()
export class RecipeIngredientInput {

    @Field(() => String)
    name!: string;

    @Field(() => Float, { nullable: true })
    quantity?: number;

    @Field(() => String, { nullable: true })
    unit?: string;
}