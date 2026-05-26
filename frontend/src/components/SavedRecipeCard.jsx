import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { UnSaveRecipe } from "../GraphQl/mutation";
import NoteModal from "./NoteModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { useNavigate } from "react-router-dom";
import { MySavedRecipes } from "../GraphQl/query";

const SavedRecipeCard = ({ recipe, savedRecipeId, savedData }) => {
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);

  const [noteOpen, setNoteOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [mode, setMode] = useState("view");

  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const openNoteModal = (type) => {
    setMode(type);

    setNoteOpen(true);

    handleMenuClose();
  };

  const {data: mysavedata, refetch} = useQuery(MySavedRecipes)

  const [removeRecipe] = useMutation(UnSaveRecipe, {
    onCompleted: () => {
      setDeleteOpen(false);
      refetch();
    },
  });

  useEffect(()=>{
    refetch()
  }, [mysavedata])

  return (
    <>
      <Card
        sx={{
          width: { xs: "250px", md: "300px" },
          height: "400px",
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: 3,
          transition: "0.3s",

          "&:hover": {
            transform: "translateY(-5px)",
          },
        }}
      >
        <CardMedia
          component="img"
          height="220"
          image={recipe.image}
          alt={recipe.title}
        />

        <CardContent>
          <Box display="flex" alignItems="start" >
            <Typography variant="h6" fontWeight="bold">
              {recipe.title}
              <IconButton onClick={handleMenuClick}>
                <MoreVertIcon />
              </IconButton>
            </Typography>
          </Box>

          <Button
            endIcon={<ArrowRightAltIcon />}
            sx={{
              mt: 2,
              textTransform: "none",
              color: "#2E7D32",
              fontWeight: 600,
            }}
            onClick={() => navigate(`/recipe/${recipe.id}`, { state: { triggerRefetch: true } })}
          >
            View Recipe
          </Button>
        </CardContent>
      </Card>

      <Menu anchorEl={anchorEl} open={openMenu} onClose={handleMenuClose}>
        <MenuItem onClick={() => openNoteModal("view")}>View Notes</MenuItem>

        <MenuItem onClick={() => openNoteModal("add")}>Add Note</MenuItem>

        <MenuItem
          sx={{ color: "red" }}
          onClick={() => {
            setDeleteOpen(true);

            handleMenuClose();
          }}
        >
          Unsave Recipe
        </MenuItem>
      </Menu>

      <NoteModal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        recipe={recipe}
        savedRecipeId={savedRecipeId}
        mode={mode}
        refetch={savedData}
      />

      <DeleteConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() =>
          removeRecipe({
            variables: {
              recipe_id: Number(recipe.id),
            },
          })
        }
      />
    </>
  );
};

export default SavedRecipeCard;
