import { Resolver, Mutation, Arg, Ctx, Query, Int } from "type-graphql"; 
import { Recipe } from "../entity/Recipes.ts"; 
import { AppDataSource } from "../config/db.ts"; 
import { Ingredient } from "../entity/Ingredient.ts"; 
import { SavedRecipe } from "../entity/SavedRecipe.ts"; 
import { Tag } from "../entity/Tag.ts"; 
import { Note } from "../entity/Note.ts"; 

@Resolver() 
export class RecipeResolver { 
    @Query(()=>[Recipe]) 
    async recipes(): Promise<Recipe[]>{ 
        const recipeRepo = AppDataSource.getRepository(Recipe); 
        return recipeRepo.find({ 
            where: { is_public: true },
            relations: ["ingredients", "tags"]
        }); 
    }

    @Query(()=>[Recipe]) 
    async myRecipes(@Ctx() context: any): Promise<Recipe[]>{ 
        const recipeRepo = AppDataSource.getRepository(Recipe); 
        if(!context.userId){ 
            throw new Error ("Unauthorized") 
        } 
        return recipeRepo.find({ 
            where: { user_id: context.userId },
            relations: ["ingredients", "tags"]
        }); 
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
            where: { user_id: context.userId }, 
            relations: ["recipe", "recipe.ingredients", "recipe.tags"] 
        }) 
        return saved.map(s => s.recipe); 
    } 

    @Mutation(() => Recipe) 
    async createRecipe( 
        @Arg("title", ()=> String) title: string, 
        @Arg("description", ()=> String) description: string, 
        @Arg("cooking_time", ()=> Int) cooking_time: number, 
        @Arg("image", ()=> String) image: string, 
        @Arg("is_public", ()=> Boolean) is_public: boolean, 
        @Arg("ingredients", ()=> [String], { nullable: true }) ingredients: string[], 
        @Arg("tags", ()=> [String], { nullable: true }) tags: string[], 
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
        
        const ingEntity = (ingredients || []).map(name => 
            ingRepo.create({ name, recipe: newRecipe}) 
        ) 
        
        await ingRepo.save(ingEntity); 

        newRecipe.ingredients = ingEntity; 

        const tagRepo = AppDataSource.getRepository(Tag); 

        let tagEntity = [] 
        for(let tagName of (tags || [])){ 
            let tag = await tagRepo.findOne({ where: { name: tagName } }) 
            if(!tag){ 
                tag = tagRepo.create({ 
                    name: tagName 
                }) 
                tag = await tagRepo.save(tag) 
            } 
            tagEntity.push(tag) 
        } 
        
        newRecipe.tags = tagEntity; 
        await recipeRepo.save(newRecipe) 
        
        return newRecipe 
    } 

    @Mutation(() => String) 
    async updateRecipe( 
        @Arg("id", ()=> Number) id: number, 
        @Arg("title", ()=> String) title: string, 
        @Arg("description", ()=> String) description: string, 
        @Arg("cooking_time", ()=> Int) cooking_time: number, 
        @Arg("image", ()=> String) image: string, 
        @Arg("is_public", ()=> Boolean) is_public: boolean, 
        @Arg("ingredients", ()=>[String], { nullable: true }) ingredients: string[], 
        @Arg("tags", ()=> [String], { nullable: true }) tags: string[], 
        @Ctx() context: any 
    ){  
        const recipeRepo = AppDataSource.getRepository(Recipe); 
        const ingRepo = AppDataSource.getRepository(Ingredient); 

        if(!context.userId){ 
            throw new Error("Not authorized") 
        } 
        
        let recipe = await recipeRepo.findOne({ where: { id } }); 
        
        if(!recipe) throw new Error("Not found"); 
        
        if(recipe.user_id !== context.userId){ 
            throw new Error("Unauthorized") 
        } 
        
        recipe = { 
            ...recipe, 
            title, 
            description, 
            cooking_time, 
            image, 
            is_public 
        } 
        
        await recipeRepo.save(recipe); 
        
        await ingRepo.delete({ recipe}); 
        
        const newIng = (ingredients || []).map(item => 
            ingRepo.create({ 
                name: item, 
                recipe
            }) 
        ) 
        
        await ingRepo.save(newIng); 
        
        recipe.ingredients = newIng; 
        
        const tagRepo = AppDataSource.getRepository(Tag); 
        
        let tagEntity = [] 
        for(let tagName of (tags || [])){ 
            let tag = await tagRepo.findOne({ where: { name: tagName } }) 
            if(!tag){ 
                tag = tagRepo.create({ 
                    name: tagName 
                }) 
                tag = await tagRepo.save(tag) 
            } 
            tagEntity.push(tag) 
        } 
        
        recipe.tags = tagEntity; 
        await recipeRepo.save(recipe) 
        
        return "Recipe Updated successfully" 
    } 

    @Mutation(() => String) 
    async deleteRecipe( 
        @Arg("id", ()=> Int) id: number, 
        @Ctx() context: any 
    ){ 
        const recipeRepo = AppDataSource.getRepository(Recipe); 

        if(!context.userId){ 
            throw new Error ("Unauthorized") 
        } 
    
        const recipe = await recipeRepo.findOne({ where: { id } }); 

        if(!recipe) throw new Error("Not found"); 
        
        if(recipe.user_id !== context.userId){ 
            throw new Error("Unauthorized") 
        } 
        
        await recipeRepo.delete(id); 
        
        return "Recipe Deleted successfully" 
    } 
    
    @Mutation(() => String) 
    async saveRecipe( 
        @Arg("recipe_id", ()=> Int) recipe_id: number, 
        @Ctx() context: any 
    ){ 
        const repo = AppDataSource.getRepository(SavedRecipe); 

         if(!context.userId){ 
            throw new Error ("Unauthorized") 
        } 

        const existing = await repo.findOne({ 
            where:{ 
                user_id: context.userId, 
                recipe_id 
            } 
        }) 

        if(existing) return "Already saved"; 

        await repo.save({ 
            user_id: context.userId, 
            recipe_id 
        }) 

        return "Saved Successfully"
    } 

      
    @Mutation(() => String) 
    async unsaveRecipe( 
        @Arg("recipe_id", ()=> Int) recipe_id: number, 
        @Ctx() context: any 
    ): Promise<String>{ 
        const repo = AppDataSource.getRepository(SavedRecipe); 

        if(!context.userId){ 
            throw new Error ("Unauthorized") 
        } 
        
        const existing = await repo.findOne({ 
            where:{ 
                user_id: context.userId, 
                recipe_id 
            } 
        })

        if(!existing) return "Not saved yet"; 

        await repo.delete(existing.id); 

        return "Recipe Unsaved" 
    } 
    
    @Mutation(()=> String) 
    async addNote( 
        @Arg("saved_recipe_id", ()=>Int) saved_recipe_id: number, 
        @Arg("note", ()=> String) note: string, 
        @Ctx() context: any 
    ){      
        const savedRepo = AppDataSource.getRepository(SavedRecipe); 
        const noteRepo = AppDataSource.getRepository(Note); 

        if(!context.userId){ 
            throw new Error ("Unauthorized") 
        } 
            
        const saved = await savedRepo.findOne({ 
            where: { id: saved_recipe_id }
        }) 
            
        if(!saved) throw new Error("Saved recipe not found") 

        if(saved.user_id !== context.userId){ 
            throw new Error("Not allowed"); 
        } 
        
        const newNote = noteRepo.create({ 
            note, 
            saved_recipe_id 
        }) 
                    
        await noteRepo.save(newNote); 
            
        return "Note added successfully" 
    } 

    @Mutation(()=> String)
    async updateNote(
        @Arg("id", ()=>Int) id: number,
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
        @Arg("id", ()=>Int) id: number,
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
        @Arg("saved_recipe_id", ()=>Int) saved_recipe_id: number,
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

    @Query(() => [Tag])
    async tags(){
        const tagRepo = AppDataSource.getRepository(Tag);
        const tags = await tagRepo.find();
        return tags
    }

    @Query(() => [Recipe])
    async recipeByTag(
        @Arg("tag", ()=> String) tag:string
    ){
        const recipeRepo = AppDataSource.getRepository(Recipe)
        const recipe = recipeRepo
                        .createQueryBuilder('recipe')
                        .leftJoinAndSelect('recipe.tags', 'tag')
                        .leftJoinAndSelect('recipe.ingredients', 'ingredients')
                        .where("LOWER(tag.name)= LOWER(:tag)", {tag: tag})
                        .getMany()

        return recipe
    }

    @Query(()=>Recipe)
    async recipeDetail(
        @Arg("id", ()=>Int) id: number,
        @Ctx() context: any
    ){
        const recipeRepo = AppDataSource.getRepository(Recipe);

        if(!context.userId){
            throw new Error("Not Autheticated")
        }

        const recipe = await recipeRepo.findOne({
            where: {id: id},
            relations: ["ingredients", "tags"]
        })
        if(!recipe){
            throw new Error("recipe not exist")
        }
        if(!recipe.is_public && recipe.user_id !== context.userId){
            throw new Error("Private Recipe")
        }
        return recipe;
    }

    @Query(()=> [Recipe])
    async popularRecipes(){
        const recipeRepo = AppDataSource.getRepository(Recipe)

        const recipes = recipeRepo
        .createQueryBuilder('recipe')
        .leftJoinAndSelect("recipe.savedBy", 'saved', 'saved.recipe_id = recipe.id')
        .where('recipe.is_public = true')
        .groupBy('recipe.id')
        .orderBy('COUNT(saved.id)', 'DESC')
        .limit(3)
        .getMany()

        return recipes
    }
}
