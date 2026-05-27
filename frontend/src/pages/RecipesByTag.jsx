import { useQuery } from "@apollo/client/react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";

import { RecipeByTags } from "../GraphQl/query";
import { useAuth } from "../context/AuthContext";

const RecipesByTagPage = () => {
  const { isAuthenticated, userId } = useAuth();
  const navigate = useNavigate()
  const location = useLocation();

  const tags = location.state;

  const { data, loading } = useQuery(RecipeByTags, {
    variables: {
      tags: tags?.map((t) => t?.trim()),
    },
  });

  function handleNavigate(recipe){
    if (recipe.is_public === true) {
      navigate(`/recipe/${recipe.id}`);
    }
    else if(!recipe.is_public && recipe.user_id === Number(userId)){
      navigate(`/recipe/${recipe.id}`);
    }
    else{
      alert("You are not logged in or recipe is private")
    }
  }

  const recipes = data?.recipeByTags || [];

  return (
    <Box p={3} sx={{mt: 10}}>

      <Typography variant="h5" mb={1}>
        Recipes By Tags
      </Typography>

      <Stack direction="row" spacing={1} my={5} flexWrap="wrap">
        {tags.map((tag, index) => (
          <Chip
            key={index}
            label={tag}
            sx={{
              bgcolor: "#2E7D32",
              color: "white",
              my: 5
            }}
          />
        ))}
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {loading ? (
        <CircularProgress />
      ) : recipes.length === 0 ? (
        <Typography>No recipes found for selected tags.</Typography>
      ) : (
        <Stack spacing={2}>
          {recipes.map((recipe) => (
            <Card key={recipe.id} sx={{ display: "flex" }} onClick={() => handleNavigate(recipe)}>
              {recipe.image && (
                <CardMedia
                  component="img"
                  sx={{ width: 160 }}
                  image={recipe.image}
                  alt={recipe.title}
                />
              )}

              <Box sx={{ display: "flex", flexDirection: "column"}}>
                <CardContent>
                  <Typography variant="h6">
                    {recipe.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {recipe.description}
                  </Typography>

                  <Typography variant="caption" display="block"  sx={{fontSize: "15px"}}>
                    Cooking Time: {recipe.cooking_time} min
                  </Typography>

                  <Stack direction="row" spacing={2} my={3} flexWrap="wrap">
                    {recipe.tags?.map((t) => (
                      <Chip
                        key={t.id}
                        label={t.name}
                        size="xl"
                        sx={{ bgcolor: "#f0f0f0" }}
                      />
                    ))}
                  </Stack>
                </CardContent>
              </Box>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default RecipesByTagPage;