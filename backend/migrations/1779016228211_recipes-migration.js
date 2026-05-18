
export const up = (pgm) => {
    pgm.createTable("recipes",{
        id: "id",
        title: {type: "text", notNull: true},
        description: {type: "text"},
        ingredients: {type: "text", notNull: true},
        cooking_time: {type: "int"},
        image: {type: "int"},
        is_public: {type: "boolean", default: true},
        user_id: {
            type: "int",
            notNull: true,
            refernces: "users",
            onDelete: "cascade"
        }
    })
}

export const down = (pgm) => {
    pgm.dropTable("recipes")
}