import { Box, Button, Container, Grid, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"

const Hero = () => {
  const navigate = useNavigate()

  return (
    <Box
        sx={{
          pt: { xs: 14, md: 18 },
          pb: 10,
          background:
            "linear-gradient(to bottom right, #E8F5E9, #FFFFFF)",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  color: "#2E2E2E",
                  fontSize: { xs: "2.5rem", md: "4rem" },
                  lineHeight: 1.2,
                }}
              >
                Discover Simple & Healthy Recipes
              </Typography>

              <Typography
                sx={{
                  mt: 3,
                  color: "#6B7280",
                  fontSize: "1.1rem",
                  maxWidth: "500px",
                }}
              >
                Cook delicious food at home with easy recipes made
                for everyday life.
              </Typography>

            <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#2E7D32",
                    px: 4,
                    py: 1.5,
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 600,
                    mt: 4,
                    "&:hover": {
                      bgcolor: "#1B5E20",
                    },
                  }}
                  onClick={()=>navigate("/recipes")}
                >
                  Explore Recipes
                </Button>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061"
                alt="food"
                sx={{
                  width: "100%",
                  borderRadius: "30px",
                  objectFit: "cover",
                  boxShadow: "0px 10px 30px rgba(0,0,0,0.1)",
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
  )
}

export default Hero