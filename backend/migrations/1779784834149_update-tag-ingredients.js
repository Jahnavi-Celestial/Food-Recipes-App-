
export const up = (pgm) => {
    pgm.sql(`
        UPDATE tags SET name = LOWER(name);
    `)

    pgm.sql(`
        UPDATE ingredients SET name = LOWER(name);
    `)
}

export const down = (pgm) => {
    pgm.sql(`
        UPDATE tags SET name = INITCAP(name);
    `)

    pgm.sql(`
        UPDATE ingredients SET name = INITCAP(name);
    `)
}

