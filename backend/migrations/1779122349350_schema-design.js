
export const up = (pgm) => {
    pgm.sql(`
        ALTER TABLE users
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN bio TEXT,
        ADD COLUMN profile_img TEXT,
        ADD COLUMN contact_no VARCHAR(15),
        ADD COLUMN google_id TEXT,
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    pgm.sql(`
        alter table recipes 
        drop column if exists ingredients;

        alter table recipes
        add column created_at timestamp default current_timestamp;

        alter table recipes
        alter column image type text;

        alter table recipes
        add column updated_at timestamp default current_timestamp;

        alter table recipes
        add constraint recipes_user_id_fkey
        foreign key(user_id) references users(id) on delete cascade;
    `)

    pgm.sql(`
        create table ingredients(
            id serial primary key,
            name varchar(100),
            recipe_id integer references recipes(id) on delete cascade
        );
    `)

    pgm.sql(`
        create table saved_recipes(
            id serial primary key,
            user_id integer references users(id) on delete cascade,
            recipe_id integer references recipes(id) on delete cascade,
            created_at timestamp default current_timestamp
        );
    `)

    pgm.sql(`
        create table notes(
            id serial primary key,
            saved_recipe_id integer references saved_recipes(id) on delete cascade,
            note text,
            created_at timestamp default current_timestamp
        );
    `)

    pgm.sql(`
        create table tags(
            id serial primary key,
            name text unique not null,
            created_at timestamp default current_timestamp
        );
    `)

    pgm.sql(`
        create table recipe_tags(
            id serial primary key,
            recipe_id integer references tags(id) on delete cascade,
            tag_id integer references tags(id) on delete cascade
        );
    `)
}

export const down = (pgm) => {
    pgm.sql(`drop table recipe_tags`);
    pgm.sql(`drop table tags`);
    pgm.sql(`drop table notes`);
    pgm.sql(`drop table saved_recipes`);
    pgm.sql(`drop table ingredients`);

    pgm.sql(`
        alter table recipes 
        add column ingredients string;

        alter table recipes
        drop column created_at;

        alter table recipes
        alter column image type integer;

        alter table recipes
        drop column updated_at;

        alter table recipes
        drop constraint recipes_user_id_fkey;
    `);

    pgm.sql(`
        alter table users
        drop column created_at,
        drop column bio,
        drop column profile_img,
        drop column google_id,
        drop column updated_at,
    `);
    
}