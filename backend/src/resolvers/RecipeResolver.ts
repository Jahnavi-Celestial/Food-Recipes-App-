import { Resolver, Mutation, Arg, Ctx, Query, Int } from "type-graphql";
import { Recipe } from "../entity/Recipes.ts";
import { AppDataSource } from "../config/db.ts";
import { Ingredient } from "../entity/Ingredient.ts";
import { SavedRecipe } from "../entity/SavedRecipe.ts";
import { Tag } from "../entity/Tag.ts";
import { Note } from "../entity/Note.ts";
import { RecipeIngredient } from "../entity/RecipeIngredient.ts";
import { RecipeIngredientInput } from "../entity/RecipeIngredientInput.ts";
import { In } from "typeorm";

@Resolver()
export class RecipeResolver {
  @Query(() => [Recipe])
  async recipes(): Promise<Recipe[]> {
    const recipeRepo = AppDataSource.getRepository(Recipe);
    return recipeRepo.find({
      where: { is_public: true },
      relations: ["ingredients", "ingredients.ingredient", "tags"],
    });
  }

  @Query(() => [Recipe])
  async myRecipes(@Ctx() context: any): Promise<Recipe[]> {
    const recipeRepo = AppDataSource.getRepository(Recipe);
    if (!context.userId) {
      throw new Error("Unauthorized");
    }
    return recipeRepo.find({
      where: { user_id: context.userId },
      relations: ["ingredients", "ingredients.ingredient", "tags"],
    });
  }

  @Query(() => [Recipe])
  async mySavedRecipes(@Ctx() context: any): Promise<Recipe[]> {
    const savedRecipeRepo = AppDataSource.getRepository(SavedRecipe);

    if (!context.userId) {
      throw new Error("Unauthorized");
    }

    const saved = await savedRecipeRepo.find({
      where: { user_id: context.userId },
      relations: ["recipe", "recipe.ingredients", "recipe.tags", "recipe.savedBy"],
    });
    return saved.map((s) => s.recipe);
  }

  @Mutation(() => Recipe)
  async createRecipe(
    @Arg("title", () => String) title: string,
    @Arg("description", () => String) description: string,
    @Arg("cooking_time", () => Int) cooking_time: number,
    @Arg("image", () => String) image: string,
    @Arg("is_public", () => Boolean) is_public: boolean,
    @Arg("ingredients", () => [RecipeIngredientInput], { nullable: true })
    ingredients: RecipeIngredientInput[],
    @Arg("tags", () => [String], { nullable: true }) tags: string[],
    @Ctx() context: any,
  ): Promise<Recipe> {
    console.log("create recipe called1");
    const recipeRepo = AppDataSource.getRepository(Recipe);
    const ingRepo = AppDataSource.getRepository(Ingredient);

    if (!context.userId) {
      throw new Error("Unauthorized");
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

    const recipeIngRepo = AppDataSource.getRepository(RecipeIngredient);

    let ingEntity: RecipeIngredient[] = [];

    for (let item of ingredients || []) {
      let ingredient = await ingRepo.findOne({
        where: { name: item.name },
      });

      if (!ingredient) {
        ingredient = ingRepo.create({ name: item.name });
        ingredient = await ingRepo.save(ingredient);
      }

      const recipeIngredient = new RecipeIngredient();

      recipeIngredient.recipe_id = newRecipe.id;
      recipeIngredient.ingredient_id = ingredient.id;
      recipeIngredient.quantity = item.quantity || 0;
      recipeIngredient.unit = item.unit || "";

      await recipeIngRepo.save(recipeIngredient);

      ingEntity.push(recipeIngredient);
    }

    newRecipe.ingredients = ingEntity;

    const tagRepo = AppDataSource.getRepository(Tag);

    let tagEntity = [];
    for (let tagName of tags || []) {
      const newName = tagName.trim().toLowerCase();
      let tag = await tagRepo.findOne({
        where: { name: newName },
      });
      if (!tag) {
        tag = tagRepo.create({ name: newName });
        tag = await tagRepo.save(tag);
      }
      tagEntity.push(tag);
    }
    newRecipe.tags = tagEntity;
    await recipeRepo.save(newRecipe);

    return newRecipe;
  }

  @Mutation(() => String)
  async updateRecipe(
    @Arg("id", () => Int) id: number,
    @Arg("title", () => String) title: string,
    @Arg("description", () => String) description: string,
    @Arg("cooking_time", () => Int) cooking_time: number,
    @Arg("image", () => String) image: string,
    @Arg("is_public", () => Boolean) is_public: boolean,
    @Arg("ingredients", () => [RecipeIngredientInput], { nullable: true })
    ingredients: RecipeIngredientInput[],
    @Arg("tags", () => [String], { nullable: true }) tags: string[],
    @Ctx() context: any,
  ) {
    const recipeRepo = AppDataSource.getRepository(Recipe);
    const ingRepo = AppDataSource.getRepository(Ingredient);

    if (!context.userId) {
      throw new Error("Not authorized");
    }

    let recipe = await recipeRepo.findOne({ where: { id } });

    if (!recipe) throw new Error("Not found");

    if (recipe.user_id !== context.userId) {
      throw new Error("Unauthorized");
    }

    recipe = {
      ...recipe,
      title,
      description,
      cooking_time,
      image,
      is_public,
    };

    await recipeRepo.save(recipe);

    const recipeIngRepo = AppDataSource.getRepository(RecipeIngredient);

    await recipeIngRepo.delete({
      recipe_id: recipe.id,
    });

    let newIng: RecipeIngredient[] = [];

    for (let item of ingredients || []) {
      let ingredient = await ingRepo.findOne({
        where: { name: item.name },
      });

      if (!ingredient) {
        ingredient = ingRepo.create({
          name: item.name,
        });

        ingredient = await ingRepo.save(ingredient);
      }

      const recipeIngredient = new RecipeIngredient();
      recipeIngredient.recipe_id = recipe.id;
      recipeIngredient.ingredient_id = ingredient.id;
      recipeIngredient.quantity = item.quantity || 0;
      recipeIngredient.unit = item.unit || "";

      await recipeIngRepo.save(recipeIngredient);

      newIng.push(recipeIngredient);
    }

    recipe.ingredients = newIng;

    await recipeRepo.save(recipe);

    const tagRepo = AppDataSource.getRepository(Tag);

    let tagEntity = [];
    for (let tagName of tags || []) {
      const newName = tagName.trim().toLowerCase();

      let tag = await tagRepo.findOne({
        where: { name: newName },
      });

      if (!tag) {
        tag = tagRepo.create({ name: newName });
        tag = await tagRepo.save(tag);
      }

      tagEntity.push(tag);
    }

    recipe.tags = tagEntity;
    await recipeRepo.save(recipe);

    return "Recipe Updated successfully";
  }

  @Mutation(() => String)
  async deleteRecipe(@Arg("id", () => Int) id: number, @Ctx() context: any) {
    const recipeRepo = AppDataSource.getRepository(Recipe);

    if (!context.userId) {
      throw new Error("Unauthorized");
    }

    const recipe = await recipeRepo.findOne({ where: { id } });

    if (!recipe) throw new Error("Not found");

    if (recipe.user_id !== context.userId) {
      throw new Error("Unauthorized");
    }

    await recipeRepo.delete(id);

    return "Recipe Deleted successfully";
  }

  @Mutation(() => String)
  async saveRecipe(
    @Arg("recipe_id", () => Int) recipe_id: number,
    @Ctx() context: any,
  ) {
    const repo = AppDataSource.getRepository(SavedRecipe);

    if (!context.userId) {
      throw new Error("Unauthorized");
    }

    const existing = await repo.findOne({
      where: {
        user_id: context.userId,
        recipe_id: recipe_id,
      },
    });

    if (existing) return "Already saved";

    const savedRecipeData = await repo.save({
      user_id: context.userId,
      recipe_id
    });

    return "Saved Successfully";
  }

  @Mutation(() => String)
  async unsaveRecipe(
    @Arg("recipe_id", () => Int) recipe_id: number,
    @Ctx() context: any,
  ): Promise<String> {
    const repo = AppDataSource.getRepository(SavedRecipe);

    if (!context.userId) {
      throw new Error("Unauthorized");
    }

    const existing = await repo.findOne({
      where: {
        user_id: context.userId,
        recipe_id,
      },
    });

    if (!existing) return "Not saved yet";

    await repo.delete(existing.id);

    return "Recipe Unsaved";
  }

  @Mutation(() => String)
  async addNote(
    @Arg("saved_recipe_id", () => Int) saved_recipe_id: number,
    @Arg("note", () => String) note: string,
    @Ctx() context: any,
  ) {
    const savedRepo = AppDataSource.getRepository(SavedRecipe);
    const noteRepo = AppDataSource.getRepository(Note);

    if (!context.userId) {
      throw new Error("Unauthorized");
    }

    const saved = await savedRepo.findOne({
      where: { id: saved_recipe_id },
    });

    if (!saved) throw new Error("Saved recipe not found");

    if (saved.user_id !== context.userId) {
      throw new Error("Not allowed");
    }

    const newNote = noteRepo.create({
      note,
      saved_recipe_id,
    });

    await noteRepo.save(newNote);

    return "Note added successfully";
  }

  @Mutation(() => String)
  async updateNote(
    @Arg("id", () => Int) id: number,
    @Arg("note", () => String) note: string,
    @Ctx() context: any,
  ) {
    const savedRecipeRepo = AppDataSource.getRepository(SavedRecipe);
    const noteRepo = AppDataSource.getRepository(Note);

    if (!context.userId) {
      throw new Error("Unauthorized");
    }

    const existingNote = await noteRepo.findOne({ where: { id: id } });

    if (!existingNote) throw new Error("note not found");

    const saved = await savedRecipeRepo.findOne({
      where: { id: existingNote.saved_recipe_id },
    });

    if (!saved) throw new Error("Saved recipe not found");

    if (saved.user_id !== context.userId) {
      throw new Error("Not allowed");
    }

    existingNote.note = note;

    await noteRepo.save(existingNote);
    return "Note updated successfully";
  }

  @Mutation(() => String)
  async deleteNote(@Arg("id", () => Int) id: number, @Ctx() context: any) {
    const savedRecipeRepo = AppDataSource.getRepository(SavedRecipe);
    const noteRepo = AppDataSource.getRepository(Note);

    if (!context.userId) {
      throw new Error("Unauthorized");
    }

    const note = await noteRepo.findOne({ where: { id: id } });

    if (!note) throw new Error("note not found");

    const saved = await savedRecipeRepo.findOne({
      where: { id: note.saved_recipe_id },
    });

    if (!saved) throw new Error("Saved recipe not found");

    if (saved.user_id !== context.userId) {
      throw new Error("Not allowed");
    }

    await noteRepo.delete(id);

    return "Note deleted";
  }

  @Query(() => [Note])
  async notesBySavedRecipe(
    @Arg("saved_recipe_id", () => Int) saved_recipe_id: number,
    @Ctx() context: any,
  ) {
    const savedRecipeRepo = AppDataSource.getRepository(SavedRecipe);
    const noteRepo = AppDataSource.getRepository(Note);

    if (!context.userId) {
      throw new Error("Unauthorized");
    }

    const saved = await savedRecipeRepo.findOne({
      where: { id: saved_recipe_id },
    });

    if (!saved) throw new Error("Saved recipe not found");

    if (saved.user_id !== context.userId) {
      throw new Error("Not allowed");
    }

    return noteRepo.find({
      where: { saved_recipe_id },
      order: { created_at: "desc" },
    });
  }

  @Query(() => [Tag])
  async tags() {
    const tagRepo = AppDataSource.getRepository(Tag);
    const tags = await tagRepo.find();
    return tags;
  }

  @Query(() => [Recipe])
  async recipeByTags(@Arg("tags", () => [String]) tags: string[]) {
    const recipeRepo = AppDataSource.getRepository(Recipe);

    const newTags = tags.map((t) => t.trim().toLowerCase());

    const matchingRecipes = await recipeRepo
      .createQueryBuilder("recipe")
      .leftJoinAndSelect("recipe.tags", "tag")
      .leftJoinAndSelect("recipe.ingredients", "recipeIngredient")
      .leftJoinAndSelect("recipeIngredient.ingredient", "ingredient")
      .where("LOWER(tag.name) IN (:...tags)", {
        tags: newTags,
      })
      .select("recipe.id")
      .getMany();

    const recipeIds = matchingRecipes.map(recipe => recipe.id)

    if(!recipeIds) return []

    const recipes = await recipeRepo.find({
      where: {
        id: In(recipeIds)
      },
      relations: ["tags", "ingredients"]
    })

    return recipes;
  }

  @Query(() => Recipe)
  async recipeDetail(@Arg("id", () => Int) id: number, @Ctx() context: any) {
    const recipeRepo = AppDataSource.getRepository(Recipe);

    const recipe = await recipeRepo.findOne({
      where: { id: id },
      relations: ["ingredients", "ingredients.ingredient", "tags"],
    });
    if (!recipe) {
      throw new Error("recipe not exist");
    }
    if (!recipe.is_public && recipe.user_id !== context.userId) {
      throw new Error("Private Recipe");
    }
    return recipe;
  }

  @Query(() => [Recipe])
  async popularRecipes() {
    const recipeRepo = AppDataSource.getRepository(Recipe);

    return await recipeRepo
      .createQueryBuilder("recipe")
      .leftJoinAndSelect("recipe.ingredients", "recipeIngredients")
      .leftJoinAndSelect("recipeIngredients.ingredient", "ingredient")
      .leftJoinAndSelect("recipe.tags", "tags")
      .leftJoinAndSelect("recipe.user", "user")
      .loadRelationCountAndMap("recipe.savedCount", "recipe.savedBy")
      .addSelect((subQuery) => {
        return subQuery
          .select("COUNT(saved.id)")
          .from("saved_recipes", "saved")
          .where("saved.recipe_id = recipe.id");
      }, "saved_count")
      .where("recipe.is_public = true")
      .orderBy("saved_count", "DESC")
      .take(3)
      .getMany();
  }
}
