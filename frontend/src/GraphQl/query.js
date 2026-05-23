import { gql } from "@apollo/client";

export const Recipes = gql`
  query GetRecipes {
    recipes {
      id
      title
      description
      cooking_time
      image
      is_public
      ingredients {
        id
        quantity
        unit
        ingredient {
          id
          name
        }
      }
      tags {
        id
        name
      }
      savedBy{
        id
      }
    }
  }
`;

export const MyRecipes = gql`
  query MyRecipes {
    myRecipes {
      id
      title
      description
      cooking_time
      image
      is_public
      ingredients {
        id
        quantity
        unit
        ingredient {
          id
          name
        }
      }
      tags {
        id
        name
      }
      savedBy{
        id
      }
    }
  }
`;

export const MySavedRecipes = gql`
  query GetMySavedRecipes {
    mySavedRecipes {
      id
      title
      description
      cooking_time
      image
      is_public
      ingredients {
        id
        quantity
        unit
        ingredient {
          id
          name
        }
      }
      tags {
        id
        name
      }
      savedBy {
        id
      }
    }
  }
`;

export const NotesBySavedRecipe = gql`
  query GetNotesBySavedRecipe($saved_recipe_id: Int!) {
    notesBySavedRecipe(saved_recipe_id: $saved_recipe_id) {
      id
      note
    }
  }
`;

export const Tags = gql`
  query GetTags {
    tags {
      id
      name
    }
  }
`;

export const RecipeByTags = gql`
  query RecipeByTags($tags: [String!]!) {
    recipeByTags(tags: $tags) {
      id
      title
      description
      cooking_time
      image
      is_public
      ingredients {
        id
        quantity
        unit
        ingredient {
          id
          name
        }
      }
      tags {
        id
        name
      }
    }
  }
`;

export const RecipeDetail = gql`
  query GetRecipeDetail($id: Int!) {
    recipeDetail(id: $id) {
      id
      title
      description
      cooking_time
      image
      is_public
      ingredients {
        id
        quantity
        unit
        ingredient {
          id
          name
        }
      }
      tags {
        id
        name
      }
    }
  }
`;

export const PopularRecipes = gql`
  query GetPopularRecipes {
    popularRecipes {
      id
      title
      description
      cooking_time
      image
      is_public
      ingredients {
        id
        quantity
        unit
        ingredient {
          id
          name
        }
      }
      tags {
        id
        name
      }
    }
  }
`;
