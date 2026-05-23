export const up = (pgm) => {
    pgm.sql(`
        drop table if exists ingredients cascade;
    `);

    pgm.sql(`
        create table ingredients(
            id serial primary key,
            name text unique not null,
            created_at timestamp default current_timestamp
        );
    `);

    pgm.sql(`
        create table recipe_ingredients(
            id serial primary key,

            recipe_id integer not null
            references recipes(id)
            on delete cascade,

            ingredient_id integer not null
            references ingredients(id)
            on delete cascade,

            quantity numeric,

            unit text
        );
    `);
};

export const down = (pgm) => {

    pgm.sql(`
        drop table if exists recipe_ingredients;
    `);

    pgm.sql(`
        drop table if exists ingredients;
    `);

    pgm.sql(`
        create table ingredients(
            id serial primary key,
            name varchar(100),
            recipe_id integer
            references recipes(id)
            on delete cascade
        );
    `);
};