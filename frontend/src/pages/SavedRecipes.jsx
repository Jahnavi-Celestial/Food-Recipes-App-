import { useQuery } from "@apollo/client/react";
import { FilterRecipes, SearchTags } from "../GraphQl/query";
import {
  Box,
  Typography,
  TextField,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useDebounce } from "../Hook/useDebounce";
import SavedRecipeCard from "../components/SavedRecipeCard";

const SavedRecipes = () => {
  const [search, setSearch] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const [sortBy, setSortBy] = useState("");
  const [maxCookTime, setMaxCookTime] = useState("");
  const [maxIngredients, setMaxIngredients] = useState("");

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const debouncedSearch = useDebounce(search, 500);
  const debouncedTags = useDebounce(tags, 500);
  const debouncedCookTime = useDebounce(maxCookTime, 500);
  const debouncedIngredients = useDebounce(maxIngredients, 500);
  const debouncedTagInput = useDebounce(tagInput, 400);

  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    debouncedTags,
    sortBy,
    debouncedCookTime,
    debouncedIngredients,
  ]);

  const {
    loading,
    data,
    refetch: savedData,
  } = useQuery(FilterRecipes, {
    variables: {
      mode: "saved",
      search: debouncedSearch || null,
      tags: debouncedTags.length ? debouncedTags : null,
      sortBy: sortBy || null,
      order: "desc",
      maxCookTime: debouncedCookTime ? Number(debouncedCookTime) : null,
      maxIngredients: debouncedIngredients
        ? Number(debouncedIngredients)
        : null,
      limit: itemsPerPage,
      skip: (page - 1) * itemsPerPage,
    },
  });

  const recipes = data?.filterRecipes || [];

  const { data: tagData } = useQuery(SearchTags, {
    variables: {
      search: debouncedTagInput,
    },
    skip: debouncedTagInput.length < 1,
  });

  useState(() => {
    savedData();
  }, data);

  if (loading) {
    return (
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" sx={{ color: "gray", fontWeight: "bold" }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        mt: 8,
        background: "linear-gradient(to bottom right, #E8F5E9, #FFFFFF)",
      }}
    >
      <Typography variant="h4" mb={3} sx={{ pb: "20px", ml: 10 }}>
        Recipes
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          pb: "30px",
          justifyContent: "center",
        }}
      >
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: "300px" }}
        />

        <Autocomplete
          multiple
          freeSolo
          options={tagData?.searchTags || []}
          value={tags}
          inputValue={tagInput}
          onInputChange={(e, value) => setTagInput(value)}
          onChange={(e, value) => setTags(value)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip label={option} {...getTagProps({ index })} />
            ))
          }
          renderInput={(params) => (
            <TextField {...params} label="Tags" placeholder="Type tags..." />
          )}
          sx={{ width: "300px" }}
        />

        <FormControl>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            displayEmpty
            sx={{ width: "250px" }}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="ingredientsAsc">Ingredients (Asc)</MenuItem>
            <MenuItem value="ingredientsDesc">Ingredients (Desc)</MenuItem>
            <MenuItem value="cookTimeAsc">Cook Time (Asc)</MenuItem>
            <MenuItem value="cookTimeDesc">Cook Time (Desc)</MenuItem>
            <MenuItem value="latest">Latest</MenuItem>
            <MenuItem value="oldest">Oldest</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Max Cook Time"
          type="number"
          value={maxCookTime}
          onChange={(e) => setMaxCookTime(e.target.value)}
          sx={{ width: "300px" }}
        />

        <TextField
          label="Max Ingredients"
          type="number"
          slotProps={{
            htmlInput: { min: 0 },
          }}
          value={maxIngredients}
          onChange={(e) => setMaxIngredients(e.target.value)}
          sx={{ width: "300px" }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 3,
          mt: 3,
        }}
      >
        {recipes.length != 0 ? (
          recipes.map((recipe) => (
            <SavedRecipeCard
              key={recipe.id}
              recipe={recipe}
              savedRecipeId={recipe?.savedBy?.[0].id}
              refetch={savedData}
            />
          ))
        ) : (
          <Box
            sx={{
              width: "100vw",
              height: "60vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="h5" sx={{ color: "gray", fontWeight: "bold" }}>
              No Recipe Found
            </Typography>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 5,
        }}
      >
        <Box sx={{ flex: 1 }} />

        {recipes.length != 0 ? (
          <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={recipes.length < itemsPerPage ? page : page + 1}
              page={page}
              onChange={(e, v) => setPage(v)}
            />
          </Box>
        ) : (
          ""
        )}

        {recipes.length != 0 ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="body2">Items/Page</Typography>

            <FormControl size="small">
              <Select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setPage(1);
                }}
              >
                <MenuItem value={4}>4</MenuItem>
                <MenuItem value={8}>8</MenuItem>
                <MenuItem value={12}>12</MenuItem>
                <MenuItem value={16}>16</MenuItem>
                <MenuItem value={20}>20</MenuItem>
              </Select>
            </FormControl>
          </Box>
        ) : (
          " "
        )}
      </Box>
    </Box>
  );
};

export default SavedRecipes;
