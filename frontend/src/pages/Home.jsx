import { Box } from "@mui/material";
import Hero from "../components/Hero";
import PopularRecipesSection from "../components/PopularRecipesSection";
import AboutUs from "../components/AboutUs";

export default function HomePage() {
  
  return (
    <Box sx={{ bgcolor: "#F9F9F9", minHeight: "100vh" }}>
      <Hero />

      <PopularRecipesSection />

      <AboutUs />
    </Box>
  );
}