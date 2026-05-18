
export const up = (pgm) => {
    pgm.sql(`alter table saved_recipes add constraint unique_user_recipe unique(user_id, recipe_id);`);
}

export const down = (pgm) => {
    pgm.sql(`alter table saved_recipes drop constraint unique_user_recipe;`);
}