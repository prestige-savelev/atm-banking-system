import { GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import { createHandler } from "graphql-http/lib/use/express";
import express from "express";
import cors from "cors";

// Construct a schema
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      hello: {
        type: GraphQLString,
        resolve: () => {
          throw new Error("Упс, ошибОчка");
        },
      },
    },
  }),
});

const app = express();

app.use(cors({ credentials: true, origin: "*" }));

// Create and use the GraphQL handler.
app.all(
  "/graphql",
  createHandler({
    schema: schema,
  }),
);

// Start the server at port
export function startGraphQLServer() {
  app.listen(4000, () => {
    console.log(
      "Running a GraphQL API server at http://localhost:4000/graphql",
    );
  });
}
