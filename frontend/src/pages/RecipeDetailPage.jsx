import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import {
  Box,
  Chip,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from '@mui/icons-material/Favorite';
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useParams } from "react-router-dom";
import { MySavedRecipes, RecipeDetail } from "../GraphQl/query";
import { useAuth } from "../context/AuthContext";
import { SaveRecipe, UnSaveRecipe } from "../GraphQl/mutation";
import { useMemo } from "react";

const RecipeDetailPage = () => {
  const client = useApolloClient();
  const { isAuthenticated } = useAuth();
  const { id } = useParams();

  const { loading, data } = useQuery(RecipeDetail, {
    variables: { id: Number(id) },
  });

  const {data: savedData, refetch: refetchSaved} = useQuery(MySavedRecipes,{skip: !isAuthenticated})
  const [saveMutation] = useMutation(SaveRecipe, {
    onCompleted: async()=>{
      await client.refetchQueries({
      include: "active", 
    });
    }
  })
  const [unsaveMutation] = useMutation(UnSaveRecipe,  {
    onCompleted: async()=>{
      await client.refetchQueries({
      include: "active", 
    });
    }
  })

  const isSaved = useMemo(()=>{
    if(!savedData?.mySavedRecipes || !data?.recipeDetail) return false;
    return savedData.mySavedRecipes.some((r) => r.id === data.recipeDetail.id)
  },[savedData, data]);

  async function handleSave(){
    try{
        if(isSaved){
            await unsaveMutation({variables: {recipe_id: Number(id)}})
        }
        else{
            await saveMutation({variables: {recipe_id: Number(id)}})
        }
        refetchSaved({ status: 'ACTIVE' });
    }catch(err){
        console.log(err.message)
    }
  }

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
    <Container
      maxWidth="100%"
      sx={{
        mt: "60px",
        mb: 10,
        background: "linear-gradient(to bottom right, #E8F5E9, #FFFFFF)",
        position: "sticky",
        top: 0
      }}
    >
      <Stack
        spacing={4}
        direction={{ xs: "column", md: "row" }}
        sx={{ justifyContent: "center", alignItems: {xs: "center", md: "flex-start"} }}
      >
        <Box
          sx={{
            flex: 1,
            position: {xs: "static", md: "sticky"} ,
            top: 70,
            height: "fit-content",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "80vh",
            pt: "30px",
          }}
        >
          <img
            src={data?.recipeDetail?.image}
            alt={data?.recipeDetail?.title}
            style={{
              margin: "60px",
              width: "80%",
              height: "600px",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1",
            }}
          />
        </Box>

        <Box sx={{ flex: 1 , py: {xs: "10px", md:  "70px"}}}>
          <Stack
            direction="row"
            justifyContent="sapce-between"
            alignItems="center"
          >
            <h1>{data?.recipeDetail.title}</h1>

            <Tooltip title={isAuthenticated ? "" : "Login to save the recipe"}>
                <span style={{display: "flex", alignItems: "center"}}>
                    <IconButton disabled={!isAuthenticated} onClick={handleSave} sx={{cursor: "pointer"}}>
                        {
                            isSaved ? <FavoriteIcon color="red"/> : <FavoriteBorderIcon />
                        }
                    </IconButton>
                </span>    
            </Tooltip>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            {data?.recipeDetail.tags.map((tag) => {
              return (
                <Chip key={tag.id} label={tag.name} color="#2E7D32"></Chip>
              );
            })}
          </Stack>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <AccessTimeIcon sx={{ mr: 1 }} />
            <Typography>
              Cooking Time: {data?.recipeDetail.cooking_time} mins
            </Typography>
          </Box>

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Ingredients:{" "}
          </Typography>
          <List sx={{ width: "100%" }}>
            {data?.recipeDetail.ingredients.map((ing) => {
              return (
                <ListItem key={ing.id} disableGutters>
                  <ListItemText
                    primary={`${ing.quantity}${ing.unit} - ${ing.ingredient.name}`}
                  />
                </ListItem>
              );
            })}
          </List>

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Instructions:{" "}
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.7, color: "" }}>
            {data?.recipeDetail.description}
          </Typography>
        </Box>
      </Stack>
    </Container>
  );
};

export default RecipeDetailPage;