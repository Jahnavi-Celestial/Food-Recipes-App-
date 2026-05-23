import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import MyRecipesPage from '../pages/MyRecipesPage';
import SavedRecipes from '../pages/SavedRecipes';
import AllRecipes from '../pages/AllRecipes';
import Layout from '../components/Layout';
import AllTags from '../pages/AllTags';
import RecipeDetailPage from '../pages/RecipeDetailPage';
import RecipesByTag from '../pages/RecipesByTag';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/recipes', element: <AllRecipes/>},
      { path: '/tags', element: <AllTags/>},
      { path: '/my-recipes', element: <MyRecipesPage /> },
      { path: '/saved-recipes', element: <SavedRecipes /> },
      { path: '/recipe/:id', element: <RecipeDetailPage /> },
      { path: "/recipes-by-tags", element: <RecipesByTag />}
    ],
  }
]);
