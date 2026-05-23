import { AppDataSource } from "../config/db.ts";
import { User } from "../entity/User.ts";
import { Recipe } from "../entity/Recipes.ts";
import { Tag } from "../entity/Tag.ts";
import { Ingredient } from "../entity/Ingredient.ts";
import { RecipeIngredient } from "../entity/RecipeIngredient.ts";
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMasterSeeder() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const userRepo = AppDataSource.getRepository(User);
    const recipeRepo = AppDataSource.getRepository(Recipe);
    const tagRepo = AppDataSource.getRepository(Tag);
    const ingRepo = AppDataSource.getRepository(Ingredient);
    const recipeIngRepo = AppDataSource.getRepository(RecipeIngredient);

    await AppDataSource.createQueryBuilder().delete().from(RecipeIngredient).execute();
    await AppDataSource.createQueryBuilder().delete().from("recipe_tags").execute();
    await AppDataSource.createQueryBuilder().delete().from(Recipe).execute();
    await AppDataSource.createQueryBuilder().delete().from(Ingredient).execute();
    await AppDataSource.createQueryBuilder().delete().from(Tag).execute();
    await AppDataSource.createQueryBuilder().delete().from(User).execute();

    try {
      await AppDataSource.query(`ALTER SEQUENCE users_id_seq RESTART WITH 1;`);
      await AppDataSource.query(`ALTER SEQUENCE tags_id_seq RESTART WITH 1;`);
      await AppDataSource.query(`ALTER SEQUENCE ingredients_id_seq RESTART WITH 1;`);
      await AppDataSource.query(`ALTER SEQUENCE recipes_id_seq RESTART WITH 1;`);
    } catch (err) {
      console.log(err)
    }

    const users = JSON.parse(fs.readFileSync(path.resolve(__dirname, './data/users.json'), 'utf8'));
    const tags = JSON.parse(fs.readFileSync(path.resolve(__dirname, './data/tags.json'), 'utf8'));
    const ingredients = JSON.parse(fs.readFileSync(path.resolve(__dirname, './data/ingredients.json'), 'utf8'));
    const recipes = JSON.parse(fs.readFileSync(path.resolve(__dirname, './data/recipes.json'), 'utf8'));

    for(const user of users){
      if(user.password){
        user.password = await bcrypt.hash(user.password, 10);
      }
    }

    const savedUsers = await userRepo.save(userRepo.create(users));
    const savedTags = await tagRepo.save(tagRepo.create(tags));

    const savedIngredients: Ingredient[] = [];
    for (const ing of ingredients) {
      let existingIng = await ingRepo.findOne({ where: { name: ing.name } });
      if (!existingIng) {
        existingIng = await ingRepo.save(ingRepo.create({ name: ing.name }));
      }
      if (existingIng) {
        savedIngredients.push(existingIng);
      }
    }

    for (const r of recipes) {
      const assignedUser = savedUsers[r.userIndex];
      if (!assignedUser) {
        continue;
      }

      const associatedTags = savedTags.filter(t => r.tags.map((name:string) => name.toLowerCase().trim()).includes(t.name.toLowerCase().trim()));

      const recipeEntity = recipeRepo.create({
        title: r.title,
        description: r.description,
        cooking_time: r.cooking_time,
        image: r.image,
        is_public: r.is_public,
        user_id: assignedUser.id,
        tags: associatedTags
      });

      const savedRecipe = await recipeRepo.save(recipeEntity);

      for (const ingItem of r.ingredients) {
        let targetIngredient = savedIngredients.find(i => i.name.toLowerCase().trim() === ingItem.name.toLowerCase().trim());

        if (!targetIngredient) {
          targetIngredient = await ingRepo.save(ingRepo.create({ name: ingItem.name }));
        }

        await recipeIngRepo.save(
          recipeIngRepo.create({
            recipe_id: savedRecipe.id,
            ingredient_id: targetIngredient.id,
            quantity: ingItem.quantity,
            unit: ingItem.unit
          })
        );
      }
    }

    console.log("Seeding completed successfully.");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await AppDataSource.destroy();
  }
}

runMasterSeeder();