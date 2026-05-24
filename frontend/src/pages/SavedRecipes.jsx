import { useQuery } from "@apollo/client/react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Pagination,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { MySavedRecipes } from "../GraphQl/query";
import SavedRecipeCard from "../components/SavedRecipeCard";
import { useState } from "react";

const SavedRecipes = () => {
  const { data, refetch } = useQuery(MySavedRecipes);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [maxCookTime, setMaxCookTime] = useState("");
  const [ingredientCount, setIngredientCount] = useState("");
  const [page, setPage] = useState(1);

  const isXs = useMediaQuery("(max-width:600px)");
  const isSm = useMediaQuery("(max-width:900px)");
  const isMd = useMediaQuery("(max-width:1200px)");

  const itemsPerPage = isXs ? 4 : isSm ? 6 : isMd ? 8 : 10;

  const filteredRecipes = data?.mySavedRecipes?.filter((recipe) => {
    const matchesSearch = recipe.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCookTime = maxCookTime
      ? recipe?.cooking_time <= Number(maxCookTime)
      : true;

    const matchesIngredients = ingredientCount
      ? recipe?.ingredients.length <= Number(ingredientCount)
      : true;

    return matchesSearch && matchesCookTime && matchesIngredients;
  });

  filteredRecipes?.sort((a, b) => {
    switch (sortBy) {
      case "ingredientsAsc":
        return a.ingredients.length - b.ingredients.length;

      case "ingredientsDesc":
        return b.ingredients.length - a.ingredients.length;

      case "cookTimeAsc":
        return a.cooking_time - b.cooking_time;

      case "cookTimeDesc":
        return b.cooking_time - a.cooking_time;

      case "latest":
        return new Date(b.createdAt) - new Date(a.createdAt);

      case "oldest":
        return new Date(a.created_at) - new Date(b.createdAt_at);

      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(filteredRecipes?.length / itemsPerPage);

  const paginatedRecipes = filteredRecipes?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handlePageChange = (e, value) => {
    setPage(value);
  };

  return (
    <Box
      sx={{
        bgcolor: "#FFFFFF",
        pt: 15,
        width: "100vw",
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #E8F5E9, #FFFFFF)",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: "bold",
          my: 3,
          mx: 3,
          pl: { xs: "30px", md: "50px" },
          fontSize: "40px",
        }}
      >
        Saved Recipes
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          mx: 3,
          pl: { xs: "30px", md: "50px" },
          mb: 4,
        }}
      >
        <TextField
          label="Search Saved Recipes"
          variant="outlined"
          value={search}
          onChange={handleSearch}
          sx={{ minWidth: 200, width: 400 }}
          slotProps={{
            htmlInput: { min: 0 },
          }}
        />

        <FormControl sx={{ minWidth: 200, width: 400 }}>
          <InputLabel>Sort By</InputLabel>

          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>

            <MenuItem value="ingredientsAsc">
              Ingredients (Low to High)
            </MenuItem>

            <MenuItem value="ingredientsDesc">
              Ingredients (High to Low)
            </MenuItem>

            <MenuItem value="cookTimeAsc">Cook Time (Fastest)</MenuItem>

            <MenuItem value="cookTimeDesc">Cook Time (Slowest)</MenuItem>

            <MenuItem value="latest">Latest Recipes</MenuItem>

            <MenuItem value="oldest">Oldest Recipes</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Max Cook Time (mins)"
          type="number"
          value={maxCookTime}
          onChange={(e) => setMaxCookTime(e.target.value)}
          sx={{ minWidth: 200, width: 400 }}
          slotProps={{
            htmlInput: { min: 0 },
          }}
        />

        <TextField
          label="Max Ingredients"
          type="number"
          value={ingredientCount}
          onChange={(e) => setIngredientCount(e.target.value)}
          sx={{ minWidth: 200, width: 400 }}
          slotProps={{
            htmlInput: { min: 0 },
          }}
        />
      </Box>

      <Grid container spacing={3} sx={{ ml: "60px" }}>
        {paginatedRecipes?.length > 0 ? (
          paginatedRecipes?.map((recipe) => (
            <Grid item key={recipe.id} xs={12} sm={6} md={4} lg={3}>
              <SavedRecipeCard
                recipe={recipe}
                savedRecipeId={recipe?.savedBy?.[0].id}
                refetch={refetch}
              />
            </Grid>
          ))
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "50vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="h5" sx={{ color: "gray", fontWeight: "bold" }}>
              No Saved Recipes Found
            </Typography>
          </Box>
        )}
      </Grid>

      {filteredRecipes?.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default SavedRecipes;
