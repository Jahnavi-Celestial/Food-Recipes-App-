import { gql } from "@apollo/client";

export const Register = gql`
  mutation register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password)
  }
`;

export const Login = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

export const GoogleLoginMutation = gql`
  mutation googleLogin($idToken: String!) {
    googleLogin(idToken: $idToken)
  }
`;

export const CreateRecipe = gql`
  mutation createRecipe(
    $title: String!
    $description: String!
    $cooking_time: Int!
    $image: String!
    $is_public: Boolean!
    $ingredients: [RecipeIngredientInput!]
    $tags: [String!]
  ) {
    createRecipe(
      title: $title
      description: $description
      cooking_time: $cooking_time
      image: $image
      is_public: $is_public
      ingredients: $ingredients
      tags: $tags
    ){
      id
      title
      tags{
        id
        name
      }
      ingredients{
        ingredient{
        name
        }
        quantity
        unit
      }
    }
  }
`;

export const UpdateRecipe = gql`
  mutation updateRecipe(
    $id: Int!
    $title: String!
    $description: String!
    $cooking_time: Int!
    $image: String!
    $is_public: Boolean!
    $ingredients: [RecipeIngredientInput!]
    $tags: [String!]
  ) {
    updateRecipe(
      id: $id
      title: $title
      description: $description
      cooking_time: $cooking_time
      image: $image
      is_public: $is_public
      ingredients: $ingredients
      tags: $tags
    )
  }
`;

export const DeleteRecipe = gql`
  mutation deleteRecipe($id: Int!) {
    deleteRecipe(id: $id)
  }
`;

export const SaveRecipe = gql`
  mutation saveRecipe($recipe_id: Int!) {
    saveRecipe(recipe_id: $recipe_id)
  }
`;

export const UnSaveRecipe = gql`
  mutation unsaveRecipe($recipe_id: Int!) {
    unsaveRecipe(recipe_id: $recipe_id)
  }
`;

export const AddNote = gql`
  mutation addNote($saved_recipe_id: Int!, $note: String!) {
    addNote(saved_recipe_id: $saved_recipe_id, note: $note)
  }
`;

export const UpdateNote = gql`
  mutation updateNote($id: Int!, $note: String!) {
    updateNote(id: $id, note: $note)
  }
`;

export const DeleteNote = gql`
  mutation deleteNote($id: Int!) {
    deleteNote(id: $id)
  }
`;
