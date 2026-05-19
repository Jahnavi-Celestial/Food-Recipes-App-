import {Resolver, Mutation, Arg, Ctx, Query} from "type-graphql";
import { Recipe } from "../entity/Recipes.ts";
import { AppDataSource } from "../config/db.ts";
import { Ingredient } from "../entity/Ingredient.ts";
import { SavedRecipe } from "../entity/SavedRecipe.ts";
import { Tag } from "../entity/Tag.ts";
import { Note } from "../entity/Note.ts";

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

        const newRecipe = await recipeRepo.save(recipe);

        const ingEntity = ingredients.map(name=>ingRepo.create({name, recipe_id: newRecipe.id}))

        await ingRepo.save(ingEntity);

        return newRecipe
    }

    @Mutation(() => String)
    async updateRecipe(
        @Arg("id", ()=>Number) id: number,
        @Arg("title", ()=>String) title: string,
        @Arg("description", ()=>String) description: string,
        @Arg("cooking_time", ()=>Number) cooking_time: number,
        @Arg("image", ()=>String) image: string,
        @Arg("is_public", ()=>Boolean) is_public: boolean,
        @Arg("ingredients", ()=>[String]) ingredients: string[],
        @Ctx() context: any
    ){
        const recipeRepo = AppDataSource.getRepository(Recipe);
        const ingRepo = AppDataSource.getRepository(Ingredient);

        if(!context.userId){
            throw new Error("Not authorized")
        }

        let recipe = await recipeRepo.findOne({where: {id}})

        if(!recipe) throw new Error("Not found")

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
    async deleteRecipe(
        @Arg("id", ()=>Number) id: number,
        @Ctx() context: any
    ){
        const recipeRepo = AppDataSource.getRepository(Recipe);

        if(!context.userId){
            throw new Error ("Unauthorized")
        }

        let recipe = await recipeRepo.findOne({where: {id}})

        if(!recipe) throw new Error("Not found")

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

    @Mutation(()=> String)
    async addNote(
        @Arg("saved_recipe_id", ()=>Number) saved_recipe_id: number,
        @Arg("note", ()=> String) note: string,
        @Ctx() context: any 
    ){
        const savedRecipeRepo = AppDataSource.getRepository(SavedRecipe);
        const noteRepo = AppDataSource.getRepository(Note);

        if(!context.userId){
            throw new Error ("Unauthorized")
        }

        const saved = await savedRecipeRepo.findOne({
            where: {id: saved_recipe_id}
        })

        if(!saved) throw new Error("Saved recipe not found")

        if(saved.user_id !== context.userId){
            throw new Error("Not allowed");
        }

        const newNote = noteRepo.create({
            note,
            saved_recipe_id: saved_recipe_id
        })

        await noteRepo.save(newNote);
        return "Note added successfully"
    }

    @Mutation(()=> String)
    async updateNote(
        @Arg("id", ()=>Number) id: number,
        @Arg("note", ()=> String) note: string,
        @Ctx() context: any 
    ){
        const savedRecipeRepo = AppDataSource.getRepository(SavedRecipe);
        const noteRepo = AppDataSource.getRepository(Note);

        if(!context.userId){
            throw new Error ("Unauthorized")
        }

        const existingNote =  await noteRepo.findOne({where: {id: id}})

        if(!existingNote) throw new Error("note not found")

        const saved = await savedRecipeRepo.findOne({
            where: {id: existingNote.saved_recipe_id}
        })

        if(!saved) throw new Error("Saved recipe not found")

        if(saved.user_id !== context.userId){
            throw new Error("Not allowed");
        }

        existingNote.note = note;

        await noteRepo.save(existingNote)
        return "Note updated successfully"
    }

    @Mutation(()=>String)
    async deleteNote(
        @Arg("id", ()=>Number) id: number,
        @Ctx() context: any 
    ){
        const savedRecipeRepo = AppDataSource.getRepository(SavedRecipe);
        const noteRepo = AppDataSource.getRepository(Note);

        if(!context.userId){
            throw new Error ("Unauthorized")
        }

        const note =  await noteRepo.findOne({where: {id: id}})

        if(!note) throw new Error("note not found")

        const saved = await savedRecipeRepo.findOne({
            where: {id: note.saved_recipe_id}
        })

        if(!saved) throw new Error("Saved recipe not found")

        if(saved.user_id !== context.userId){
            throw new Error("Not allowed");
        }

        await noteRepo.delete(id)

        return "Note deleted"
    }

    @Query(()=>[Note])
    async notesBySavedRecipe(
        @Arg("saved_recipe_id", ()=>Number) saved_recipe_id: number,
        @Ctx() context: any 
    ){
        const savedRecipeRepo = AppDataSource.getRepository(SavedRecipe);
        const noteRepo = AppDataSource.getRepository(Note);

        if(!context.userId){
            throw new Error ("Unauthorized")
        }

        const saved = await savedRecipeRepo.findOne({
            where: {id: saved_recipe_id}
        }) 

        if(!saved) throw new Error("Saved recipe not found")

        if(saved.user_id !== context.userId){
            throw new Error("Not allowed");
        }

        return noteRepo.find({
            where: {saved_recipe_id},
            order: {created_at: "desc"}
        })
    }
}
