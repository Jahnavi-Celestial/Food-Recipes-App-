import { useQuery } from "@apollo/client/react";
import { Recipes } from "../GraphQl/query";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import RecipeCard from "../components/RecipeCard";
import { useState } from "react";

const AllRecipes = () => {
  const { loading, data } = useQuery(Recipes);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [maxCookTime, setMaxCookTime] = useState("");
  const [ingredientCount, setIngredientCount] = useState("");
  const [searchByTags, setSearchByTags] = useState("");
  const [page, setPage] = useState(1);
  
  const defaultValue = 12;
  const [itemsPerPage, setItemsPerPage] = useState(defaultValue) 

  const filteredRecipes = data?.recipes?.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(search.toLowerCase());

    const matchesTagSearch = searchByTags === "" || recipe.tags.some((tag) => tag.name.toLowerCase().includes(searchByTags.toLowerCase()));

    const matchesCookTime = maxCookTime ? recipe?.cooking_time <= Number(maxCookTime) : true;

    const matchesIngredients = ingredientCount ? recipe?.ingredients.length <= Number(ingredientCount) : true;

    return matchesSearch && matchesCookTime && matchesIngredients && matchesTagSearch;
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
        return new Date(b.created_at) - new Date(a.created_at);

      case "oldest":
        return new Date(a.created_at) - new Date(b.created_at);

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

  const handleSearchTag = (e) => {
    setSearchByTags(e.target.value)
    setPage(1)
  }

  const handlePageChange = (e, value) => {
    setPage(value);
  };

  const handleItemsPerPage = (e) => {
    setItemsPerPage(Number(e.target.value))
    setPage(1)
  }

  if(loading){
    return <Box sx={{width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center"}}>
      <Typography variant="h5" sx={{ color: "gray", fontWeight: "bold" }}>Loading...</Typography>
    </Box>
  }

  return (
    <Box
      sx={{
        bgcolor: "#FFFFFF",
        py: 15,
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
        Recipes
      </Typography>

      <FormControl sx={{width: "100px", pl: { xs: "30px", md: "50px" }, mx: 3, my: 3}} >
        <InputLabel sx={{pl: { xs: "30px", md: "50px"}, mx: 2}}>Items/Page</InputLabel>
        <Select value={itemsPerPage} label="Items/Page" onChange={handleItemsPerPage}>
          <MenuItem value={4}>4</MenuItem>
          <MenuItem value={8}>8</MenuItem>
          <MenuItem value={12}>12</MenuItem>
          <MenuItem value={16}>16</MenuItem>
          <MenuItem value={20}>20</MenuItem>
        </Select>
      </FormControl>

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
          label="Search Recipes"
          variant="outlined"
          value={search}
          onChange={handleSearch}
          sx={{ minWidth: 200, width: "18%" }}
        />

        <TextField
          label="Search Recipes By Tag"
          variant="outlined"
          value={searchByTags}
          onChange={handleSearchTag}
          sx={{ minWidth: 200, width: "18%" }}
        />

        <FormControl sx={{ minWidth: 200, width: "18%" }}>
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
          sx={{ minWidth: 200, width: "18%" }}
          slotProps={{
            htmlInput: { min: 0 },
          }}
        />

        <TextField
          label="Max Ingredients"
          type="number"
          value={ingredientCount}
          onChange={(e) => setIngredientCount(e.target.value)}
          sx={{ minWidth: 200, width: "18%" }}
          slotProps={{
            htmlInput: { min: 0 },
          }}
        />
      </Box>

      <Grid container spacing={4} sx={{ ml: { xs: "40px", md: "60px" } }}>
        {paginatedRecipes?.length > 0 ? (
          paginatedRecipes?.map((recipe) => (
            <Grid item key={recipe.id} xs={12} sm={6} md={4} lg={3}>
              {" "}
              <RecipeCard recipe={recipe} canEdit={false} />
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
              No Recipes Found
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

export default AllRecipes;
