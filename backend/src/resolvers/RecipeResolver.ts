import {Resolver, Mutation, Arg, Ctx, Query} from "type-graphql";
import { Recipe } from "../entity/Recipes.ts";
import { AppDataSource } from "../config/db.ts";
import { Ingredient } from "../entity/Ingredient.ts";
import { SavedRecipe } from "../entity/SavedRecipe.ts";

@Resolver()
export class RecipeResolver{
    @Query(()=>[Recipe])
    async recipes(): Promise<Recipe[]>{
        const recipeRepo = AppDataSource.getRepository(Recipe);
        return recipeRepo.find({ where: { is_public: true } });
    }

    @Query(()=>[Recipe])
    async myRecipes(@Ctx() context: any): Promise<Recipe[]>{
        const recipeRepo = AppDataSource.getRepository(Recipe);
        if(!context.userId){
            throw new Error ("Unauthorized")
        }
        return recipeRepo.find({ where: { user_id: context.userId } });
    }

    @Query(()=>[Recipe])
    async mySavedRecipes(
        @Ctx() context: any
    ): Promise<Recipe[]>{
        const savedRecipeRepo = AppDataSource.getRepository(SavedRecipe);

        if(!context.userId){
            throw new Error ("Unauthorized")
        }

        const saved = await savedRecipeRepo.find({
            where: {user_id: context.userId}
        })

        return saved.map(s=>s.recipe);
    }

    @Mutation(() => Recipe)
    async createRecipe(
        @Arg("title", ()=>String) title: string,
        @Arg("description", ()=>String) description: string,
        @Arg("cooking_time", ()=>Number) cooking_time: number,
        @Arg("image", ()=>String) image: string,
        @Arg("is_public", ()=>Boolean) is_public: boolean,
        @Arg("ingredients", ()=> [String]) ingredients: string[],
        @Ctx() context: any
    ): Promise<Recipe>{
        const recipeRepo = AppDataSource.getRepository(Recipe);
        const ingRepo = AppDataSource.getRepository(Ingredient);

        if(!context.userId){
            throw new Error ("Unauthorized")
        }

        const recipe = recipeRepo.create({
            title,
            description,
            cooking_time,
            image,
            is_public,
            user_id: context.userId,
        });

        const ingEntity = ingredients.map(name=>ingRepo.create({name, recipe_id: recipe.id}))

        await ingRepo.save(ingEntity);

        return recipeRepo.save(recipe);
    }

    @Mutation(() => String)
    async updateRecipe(
        @Arg("id", ()=>Number) id: number,
        @Arg("title", ()=>String) title: string,
        @Arg("description", ()=>String) description: string,
        @Arg("cooking_time", ()=>String) cooking_time: number,
        @Arg("image", ()=>String) image: string,
        @Arg("is_public", ()=>Boolean) is_public: boolean,
        @Arg("ingredients", ()=>[String]) ingredients: string[],
        @Ctx() context: any
    ){
        const recipeRepo = AppDataSource.getRepository(Recipe);
        const ingRepo = AppDataSource.getRepository(Ingredient);

        let recipe = await recipeRepo.findOne({where: {id}})

        if(!recipe) throw new Error("Not found")

        if(recipe.user_id !== context.userId){
            throw new Error("Not authorized")
        }

        recipe = {
            ...recipe, title, description, cooking_time, image, is_public
        }

        await recipeRepo.save(recipe);

        await ingRepo.delete({recipe_id: id});

        const newIng = ingredients.map((item)=>{
            return ingRepo.create({
                name: item,
                recipe_id: id
            })
        })
        await ingRepo.save(newIng)

        return "Recipe Updated successfully"
    }

    @Mutation(() => String)
    async DeleteRecipe(
        @Arg("id", ()=>Number) id: number,
        @Ctx() context: any
    ){
        const recipeRepo = AppDataSource.getRepository(Recipe);

        let recipe = await recipeRepo.findOne({where: {id}})

        if(!recipe) throw new Error("Not found")

        if(recipe.user_id !== context.userId){
            throw new Error("Not authorized")
        }

        await recipeRepo.delete(id);

        return "Recipe Deleted successfully"
    }


    @Mutation(() => String)
    async saveRecipe(
        @Arg("recipe_id",()=>Number) recipe_id: number,
        @Ctx() context: any
    ): Promise<String>{
        const recipeRepo = AppDataSource.getRepository(SavedRecipe);

        if(!context.userId){
            throw new Error ("Unauthorized")
        }
        
        const existing = await recipeRepo.findOne({
            where:{
                user_id: context.userId,
                recipe_id: recipe_id
            }
        })

        if(existing) return "Already saved";

        await recipeRepo.save({
            user_id: context.userId,
            recipe_id
        })
        
        return "Saved Successfully"
    }

    @Mutation(() => String)
    async unsaveRecipe(
        @Arg("recipe_id",()=>Number) recipe_id: number,
        @Ctx() context: any
    ): Promise<String>{
        const recipeRepo = AppDataSource.getRepository(SavedRecipe);

        if(!context.userId){
            throw new Error ("Unauthorized")
        }
        
        const existing = await recipeRepo.findOne({
            where:{
                user_id: context.userId,
                recipe_id: recipe_id
            }
        })

        if(!existing) return "Not saved yet";

        await recipeRepo.delete(existing.id);
        
        return "Recipe Unsaved"
    }
}
