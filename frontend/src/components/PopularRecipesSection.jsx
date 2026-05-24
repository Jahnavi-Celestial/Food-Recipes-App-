import { Container, Typography } from "@mui/material";
import RecipeCard from "./RecipeCard";
import { useQuery } from "@apollo/client/react";
import { PopularRecipes } from "../GraphQl/query";
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow , Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import '../styles.css';

const PopularRecipesSection = () => {
  const { loading, data } = useQuery(PopularRecipes);

  const recipes = data?.popularRecipes

  if(loading){
    return <Typography variant="h5" sx={{ color: "gray", fontWeight: "bold", textAlign: "center"}}>Loading...</Typography>
  }

  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
      <Typography
        variant="h4"
        sx={{
          textAlign: "center",
          fontWeight: 700,
          color: "#2E2E2E",
          mb: 2,
        }}
      >
        Popular Recipes
      </Typography>

      <Typography
        sx={{
          textAlign: "center",
          color: "#777",
          mb: 6,
        }}
      >
        Easy and tasty recipes loved by everyone.
      </Typography>

      <Swiper
        effect={'coverflow'}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={'auto'}
        initialSlide={1}
        slidesPerView={'auto'}
        slideToClickedSlide={true}
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: false,
        }}
        pagination={{clickable: true}}
        modules={[EffectCoverflow, Pagination]}
        className="mySwiper"
      >
        {recipes?.map((recipe) => (
          <SwiperSlide key={recipe.id}>
            <RecipeCard recipe={recipe} />
          </SwiperSlide>
        ))}
      </Swiper>
    </Container>
  );
};

export default PopularRecipesSection;

