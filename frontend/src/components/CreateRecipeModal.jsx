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
  Autocomplete,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";
import { CreateRecipe } from "../GraphQl/mutation";
import { SearchTags } from "../GraphQl/query";
import { useDebounce } from "../Hook/useDebounce";

const CreateRecipeModal = ({ open, onClose }) => {
  const client = useApolloClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cookingTime, setCookingTime] = useState(0);
  const [image, setImage] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [ingredients, setIngredients] = useState([
    { name: "", quantity: 0, unit: "" },
  ]);

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const debouncedTagInput = useDebounce(tagInput, 400);

  const { data: tagData } = useQuery(SearchTags, {
    variables: {
      search: debouncedTagInput,
    },
    skip: debouncedTagInput.length < 1,
  });

  const [createRecipe, { loading }] = useMutation(CreateRecipe, {
    onCompleted: async()=>{
      await client.refetchQueries({
        include: "all",
      });
    }
  });

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
          tags: tags.map((t) => t.trim()), 
        },
      });

      setTitle("");
      setDescription("");
      setCookingTime(0);
      setImage("");
      setIsPublic(true);
      setIngredients([{ name: "", quantity: 0, unit: "" }]);
      setTags([]);
      setTagInput(""); 

      onClose();
    }
    catch(err){
      console.log(err)
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
            control = {
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
              options={tagData?.searchTags || []}
              value={tags}
              inputValue={tagInput}
              onInputChange={(e, value) => setTagInput(value)}
              onChange={(e, value) => setTags(value)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return <Chip key={key} label={option} {...tagProps} />;
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tags"
                  placeholder="Type tags..."
                />
              )}
              sx={{ width: "100%" }}
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
                    value={ingredient.unit || ""}
                    onChange={(e) =>
                      handleIngredientChange(index, "unit", e.target.value)
                    }
                  />
                  
                  <IconButton 
                    onClick={() => removeIngredient(index)}
                    color="red"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading} sx={{color: "#2E7D32"}}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading} sx={{bgcolor: "#2E7D32"}}>
          {loading ? "Creating..." : "Create Recipe"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateRecipeModal;

