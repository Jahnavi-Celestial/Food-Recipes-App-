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
  @Query(() => [Recipe!])
  async recipes(): Promise<Recipe[]> {
    const recipeRepo = AppDataSource.getRepository(Recipe);

    const recipes = await recipeRepo.find({
      where: { is_public: true },
      relations: ["ingredients", "ingredients.ingredient", "tags"],
    });

    return recipes;
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
      relations: [
        "recipe",
        "recipe.ingredients",
        "recipe.ingredients.ingredient",
        "recipe.tags",
        "recipe.savedBy",
      ],
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
    try {
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
          where: { name: item.name.toLowerCase() },
        });

        if (!ingredient) {
          ingredient = ingRepo.create({ name: item.name.toLowerCase() });
          ingredient = await ingRepo.save(ingredient);
        }

        const recipeIngredient = new RecipeIngredient();
        recipeIngredient.recipe = newRecipe;
        recipeIngredient.ingredient = ingredient;
        recipeIngredient.quantity = item.quantity || 0;
        recipeIngredient.unit = item.unit || "";

        await recipeIngRepo.save(recipeIngredient);
        ingEntity.push(recipeIngredient);
      }

      newRecipe.ingredients = ingEntity;

      const tagRepo = AppDataSource.getRepository(Tag);

      if (tags && tags.length > 0) {
        const newName = tags.map((t) => t.trim().toLowerCase());

        const existingTags = await tagRepo.find({
          where: {
            name: In(newName),
          },
        });

        newRecipe.tags = existingTags;
      } else {
        newRecipe.tags = [];
      }

      return await recipeRepo.save(newRecipe);
    } catch (err: any) {
      console.error("Error saving tags:", err.message || err);
      throw new Error(`Failed to save tags: ${err.message}`);
    }
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
    try {
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

      if (tags && tags.length > 0) {
        const newName = tags.map((t) => t.trim().toLowerCase());

        const existingTags = await tagRepo.find({
          where: {
            name: In(newName),
          },
        });

        recipe.tags = existingTags;
      } else {
        recipe.tags = [];
      }

      await recipeRepo.save(recipe);

      return "Recipe Updated successfully";
    } catch (err: any) {
      console.log(err.message);
    }
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
      recipe_id,
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

    const recipes = await recipeRepo
      .createQueryBuilder("recipe")
      .distinct(true)
      .leftJoinAndSelect("recipe.tags", "tag")
      .leftJoinAndSelect("recipe.ingredients", "ingredient")
      .leftJoinAndSelect("ingredient.ingredient", "ing")
      .where("LOWER(tag.name) IN (:...tags)", { tags: newTags })
      .orderBy("recipe.created_at", "DESC")
      .getMany();

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

  @Query(() => [Recipe])
  async filterRecipes(
    @Arg("mode", () => String) mode: "public" | "private" | "saved",
    @Arg("search", () => String, { nullable: true }) search?: string,
    @Arg("tags", () => [String], { nullable: true }) tags?: string[],
    @Arg("sortBy", () => String, { nullable: true }) sortBy?: string,
    @Arg("order", () => String, { nullable: true })
    order: "asc" | "desc" = "desc",
    @Arg("maxCookTime", () => Int, { nullable: true }) maxCookTime?: number,
    @Arg("maxIngredients", () => Int, { nullable: true })
    maxIngredients?: number,
    @Arg("limit", () => Int, { defaultValue: 12 }) limit: number,
    @Arg("skip", () => Int, { defaultValue: 0 }) skip: number,
    @Ctx() ctx: any,
  ): Promise<Recipe[]> {
    const recipeRepo = AppDataSource.getRepository(Recipe);
    const savedRepo = AppDataSource.getRepository(SavedRecipe);

    let recipes: Recipe[] = [];

    if (mode === "public") {
      const hasFilters =
        search || tags?.length || maxCookTime || maxIngredients || sortBy;

      const [recipesData, total] = await recipeRepo.findAndCount({
        where: { is_public: true },
        relations: ["ingredients", "ingredients.ingredient", "tags"],

        ...(hasFilters
          ? {}
          : {
              skip,
              take: limit,
            }),
      });

      recipes = recipesData;
    }

    if (mode === "private") {
      if (!ctx.userId) throw new Error("Unauthorized");

      const hasFilters =
        search || tags?.length || maxCookTime || maxIngredients || sortBy;

      const [recipesData, total] = await recipeRepo.findAndCount({
        where: { user_id: ctx.userId },
        relations: ["ingredients", "ingredients.ingredient", "tags"],

        ...(hasFilters ? {} : { skip, take: limit }),
      });

      recipes = recipesData;
    }

    if (mode === "saved") {
      if (!ctx.userId) throw new Error("Unauthorized");

      const hasFilters =
        search || tags?.length || maxCookTime || maxIngredients || sortBy;

      const [saved, total] = await savedRepo.findAndCount({
        where: { user_id: ctx.userId },
        relations: [
          "recipe",
          "recipe.ingredients",
          "recipe.ingredients.ingredient",
          "recipe.tags",
          "recipe.savedBy",
        ],

        ...(hasFilters ? {} : { skip, take: limit }),
      });

      recipes = saved.map((s) => s.recipe);
    }

    if (search) {
      recipes = recipes.filter((r) =>
        r.title.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (tags && tags.length > 0) {
      const lowerTags = tags.map((t) => t.toLowerCase());

      recipes = recipes.filter((r) =>
        r.tags?.some((t) => lowerTags.includes(t.name.toLowerCase())),
      );
    }

    if (maxCookTime != null) {
      recipes = recipes.filter((r) => r.cooking_time <= maxCookTime);
    }

    if (maxIngredients != null) {
      recipes = recipes.filter((r) => r.ingredients.length <= maxIngredients);
    }

    switch (sortBy) {
      case "ingredientsAsc":
        recipes.sort((a, b) => a.ingredients.length - b.ingredients.length);
        break;

      case "ingredientsDesc":
        recipes.sort((a, b) => b.ingredients.length - a.ingredients.length);
        break;

      case "cookTimeAsc":
        recipes.sort((a, b) => a.cooking_time - b.cooking_time);
        break;

      case "cookTimeDesc":
        recipes.sort((a, b) => b.cooking_time - a.cooking_time);
        break;

      case "latest":
        recipes.sort(
          (a, b) =>
            new Date(Number(b.created_at)).getTime() -
            new Date(Number(a.created_at)).getTime(),
        );
        break;

      case "oldest":
        recipes.sort(
          (a, b) =>
            new Date(Number(a.created_at)).getTime() -
            new Date(Number(b.created_at)).getTime(),
        );
        break;

      default:
        break;
    }
    return recipes;
  }

  @Query(() => [String])
  async searchTags(
    @Arg("search", () => String) search: string,
  ): Promise<string[]> {
    const tagRepo = AppDataSource.getRepository(Tag);

    const tags = await tagRepo
      .createQueryBuilder("tag")
      .where("LOWER(tag.name) LIKE LOWER(:search)", {
        search: `%${search}%`,
      })
      .limit(10)
      .getMany();

    return tags.map((t) => t.name);
  }
}
