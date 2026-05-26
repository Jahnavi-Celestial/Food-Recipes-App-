import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import EditRecipeModal from "./EditRecipe";
import { useMutation } from "@apollo/client/react";
import { DeleteRecipe } from "../GraphQl/mutation";

const RecipeCard = ({ recipe, canEdit, refetch }) => {
  const [EditOpen, setEditOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [deleteRecipe] = useMutation(DeleteRecipe,{
    onCompleted:() => {
      refetch()
    }
  });

  const handleViewBtn = () => {
    if (isAuthenticated || recipe.is_public == true) {
      navigate(`/recipe/${recipe.id}`, { state: { triggerRefetch: true }});
    }
  };

  async function handleDelete(id) {
    deleteRecipe({
      variables: { id: id },
    });
  }

  return (
    <Card
      sx={{
        width: "300px",
        height: "400px",
        borderRadius: "20px",
        boxShadow: "0px 5px 20px rgba(0,0,0,0.06)",
        objectFit: "cover",
        transition: "transform 0.2s",
        "&:hover": { transform: "scale(1.02)" },
      }}
    >
      <CardMedia
        component="img"
        height="220"
        image={recipe.image}
        alt={recipe.title}
      />

      <CardContent>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#2E2E2E",
          }}
        >
          {recipe.title}
        </Typography>

        {isAuthenticated && canEdit ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Button
              sx={{
                mt: 2,
                color: "#2E7D32",
                textTransform: "none",
                fontWeight: 600,
                p: 0,
              }}
              onClick={() => {
                setEditOpen(true);
              }}
            >
              Edit Recipe
            </Button>
            <Button
              sx={{
                mt: 2,
                color: "#2E7D32",
                textTransform: "none",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                p: 0,
              }}
              onClick={() => {
                handleDelete(Number(recipe.id));
              }}
            >
              Delete Recipe
            </Button>
          </Box>
        ) : (
          ""
        )}

        <Button
          sx={{
            mt: 2,
            color: "#2E7D32",
            textTransform: "none",
            fontWeight: 600,
            p: 0,
          }}
          onClick={handleViewBtn}
        >
          View Recipe <ArrowRightAltIcon />
        </Button>
      </CardContent>

      {
        canEdit && (
          <EditRecipeModal
            open={EditOpen}
            onClose={() => setEditOpen(false)}
            recipe={recipe}
          />
        )
      }
    </Card>
  );
};

export default RecipeCard;
