import { useMutation, useQuery } from "@apollo/client/react";
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
  const { isAuthenticated } = useAuth();
  const { id } = useParams();

  const { error, data } = useQuery(RecipeDetail, {
    variables: { id: Number(id) },
  });

  const {data: savedData, refetch: refetchSaved} = useQuery(MySavedRecipes,{skip: !isAuthenticated})
  const [saveMutation] = useMutation(SaveRecipe)
  const [unsaveMutation] = useMutation(UnSaveRecipe)

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
        refetchSaved()
    }catch(err){
        console.log(err.message)
    }
  }

  if (error == "Private Recipe") return <div>Private Recipe</div>;
  if (error == "recipe not exist") return <div>Recipe Not Exist</div>;

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
          <Typography>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero
            totam provident eveniet quis in odit non quae rem eaque dolorum
            commodi laboriosam, alias consequuntur adipisci veritatis, amet
            itaque. Dolorem magnam sunt sequi pariatur soluta? Veritatis
            possimus nulla necessitatibus libero voluptatum animi vitae sit
            accusantium aliquam ex omnis mollitia commodi perspiciatis
            consequatur voluptates facere ad, nam sed pariatur cupiditate
            voluptas corrupti? Dignissimos ad id minima pariatur! Sint minus
            deserunt corrupti voluptatem nesciunt cumque atque repellendus
            repudiandae dolor sapiente magnam voluptatibus accusantium deleniti
            non maiores doloribus aspernatur est impedit dolore, dolorum aliquam
            adipisci delectus pariatur. Voluptas blanditiis consectetur porro
            commodi ratione illo? Lorem ipsum dolor sit amet consectetur
            adipisicing elit. Amet nemo molestiae sunt vitae odit, accusantium
            possimus dignissimos? Accusantium corrupti dolore nostrum, eveniet
            asperiores vel ratione, dolor, culpa iure ullam at. Lorem ipsum
            dolor sit amet consectetur adipisicing elit. Quia, voluptate in
            labore fuga at temporibus suscipit unde reprehenderit autem ab sint
            aliquid voluptatem dolorem, velit ratione laborum repudiandae
            repellat rem!
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Enim minima iste itaque esse officiis dicta, maiores inventore! Nostrum cumque accusantium perspiciatis voluptates neque ipsum quo! Eveniet, numquam. Perspiciatis, deleniti quas.
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto repudiandae assumenda reiciendis velit accusantium odio aliquid rerum, vel expedita voluptatem nulla autem sint, quisquam culpa ipsam architecto animi necessitatibus impedit!
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem nemo voluptate dolores eveniet autem ad labore officia est ratione laborum, esse voluptatem veritatis! Vero optio cum excepturi ab reprehenderit quasi.
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam ratione quasi reprehenderit modi ab recusandae itaque nesciunt, et, quam quaerat est animi iusto reiciendis, perferendis eos! Cumque ipsa eius quae.
          </Typography>
        </Box>
      </Stack>
    </Container>
  );
};

export default RecipeDetailPage;
