import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "type-graphql";
import { authMiddleware, AuthReq } from "./src/middleware/authMiddleware.ts";
import { UserResolver } from "./src/resolvers/UserResolver.ts"
import { RecipeResolver } from "./src/resolvers/RecipeResolver.ts"
import cors  from "cors";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost: "
}))

app.use(express.json());
app.use(authMiddleware);

const schema = await buildSchema({
    resolvers: [UserResolver, RecipeResolver],
})

app.use(
  "/graphql", graphqlHTTP((req: any) => ({
      schema,
      graphiql: true,
      context: {userId: (req as AuthReq).userId},
    }))
);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});