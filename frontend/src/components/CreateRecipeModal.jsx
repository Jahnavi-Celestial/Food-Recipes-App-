import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  IconButton,
  FormControlLabel,
  Switch,
  Box,
  Chip,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";
import { CreateRecipe } from "../GraphQL/mutation";
import { Tags } from "../graphql/query";

const CreateRecipeModal = ({ open, onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cookingTime, setCookingTime] = useState(0);
  const [image, setImage] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [ingredients, setIngredients] = useState([
    { name: "", quantity: 0, unit: "" },
  ]);
  const [selectedTags, setSelectedTags] = useState([]);

  const [createRecipe, { loading }] = useMutation(CreateRecipe);
  const { data: tagData, loading: tagsLoading } = useQuery(Tags);

  const tagOptions = tagData?.tags?.map((t) => t.name) || [];

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: 0, unit: "" }]);
  };

  const removeIngredient = (index) => {
    const updated = [...ingredients];
    updated.splice(index, 1);
    setIngredients(updated);
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const handleTagChange = (event, newValue) => {
    const unique = [];

    newValue.forEach((tag) => {
      const t = tag.trim();
      const exists = unique.find((x) => x.toLowerCase() === t.toLowerCase());

      if (!exists && t !== "") {
        unique.push(t);
      }
    });

    setSelectedTags(unique);
  };

  const handleSubmit = async () => {
    try {
      await createRecipe({
        variables: {
          title,
          description,
          cooking_time: Number(cookingTime),
          image,
          is_public: isPublic,

          ingredients: ingredients.filter((i) => i.name.trim() !== ""),

          tags: selectedTags.map((t) => t.trim()),
        },
      });

      setTitle("");
      setDescription("");
      setCookingTime(0);
      setImage("");
      setIsPublic(true);
      setIngredients([{ name: "", quantity: 0, unit: "" }]);
      setSelectedTags([]);

      onClose();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Create Recipe</DialogTitle>

      <DialogContent>
        <Stack spacing={3} mt={1}>
          <TextField
            label="Recipe Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <TextField
            label="Instructions"
            fullWidth
            multiline
            minRows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <TextField
            label="Cooking Time (minutes)"
            type="number"
            fullWidth
            value={cookingTime}
            onChange={(e) => setCookingTime(e.target.value)}
            slotProps={{
              htmlInput: { min: 0 },
            }}
          />

          <TextField
            label="Image URL"
            fullWidth
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />

          <FormControlLabel
            control={
              <Switch
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
            }
            label="Public Recipe"
          />

          <Box>
            <Typography mb={1}>Tags</Typography>

            <Autocomplete
              multiple
              freeSolo
              options={tagOptions}
              value={selectedTags}
              onChange={handleTagChange}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    key={`${option}-${index}`}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select or create tags"
                  placeholder="Type and press enter"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {tagsLoading && <CircularProgress size={18} />}
                        {params?.InputProps?.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Box>

          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography variant="h6">Ingredients</Typography>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addIngredient}
                sx={{ bgcolor: "#2E7D32", mx: 3 }}
              >
                Add Ingredient
              </Button>
            </Stack>

            <Stack spacing={2} sx={{ mt: 3 }}>
              {ingredients.map((ingredient, index) => (
                <Stack
                  key={index}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                >
                  <TextField
                    label="Ingredient"
                    fullWidth
                    slotProps={{
                      htmlInput: { min: 0 },
                    }}
                    value={ingredient.name}
                    onChange={(e) =>
                      handleIngredientChange(index, "name", e.target.value)
                    }
                  />

                  <TextField
                    label="Qty"
                    type="number"
                    sx={{ width: 120 }}
                    slotProps={{
                      htmlInput: { min: 0 },
                    }}
                    value={ingredient.quantity}
                    onChange={(e) =>
                      handleIngredientChange(
                        index,
                        "quantity",
                        Number(e.target.value),
                      )
                    }
                  />

                  <TextField
                    label="Unit"
                    sx={{ width: 140 }}
                    value={ingredient.unit}
                    onChange={(e) =>
                      handleIngredientChange(index, "unit", e.target.value)
                    }
                  />

                  <IconButton
                    color="error"
                    onClick={() => removeIngredient(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ color: "#2E7D32" }}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ bgcolor: "#2E7D32" }}
        >
          {loading ? "Creating..." : "Create Recipe"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateRecipeModal;
