export const up = (pgm) => {
    pgm.sql(`
        alter table recipe_tags
        add constraint recipe_tag_recipe_id_fkey
        foreign key(recipe_id)
        references recipes(id)
        on delete cascade;
    `);
}

export const down = (pgm) => {
    pgm.sql(`
        alter table recipe_tags
        drop constraint recipe_tag_recipe_id_fkey; 
    `);
}