import { Unique } from "typeorm"

export const up = (pgm) => {
    pgm.createTable("users",{
        id: "id",
        name: {type: "text", notNull: true},
        email: {type: "text", notNull: true, unique: true},
        password: {type: "text"},
    })
}

export const down = (pgm) => {
    pgm.dropTable("users")
}