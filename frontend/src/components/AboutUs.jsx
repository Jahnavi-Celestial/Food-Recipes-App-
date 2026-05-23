import { Box, Container, Stack, Typography } from "@mui/material";

const AboutUs = () => {
  return (
    <Box sx={{ bgcolor: "#FFFFFF", py: 10 }}>
      <Container >
        <Stack spacing={4}
            direction={{ xs: "column", sm: "row" }}
            sx={{ justifyContent: "center", alignItems: "flex-start"}}
        >
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1515003197210-e0cd71810b5f"
              alt="about"
              sx={{
                width: {xs: "100%", sm: "40%", md: "50%"},
                height: {xs: "400px"},
                borderRadius: "30px",
                boxShadow: "0px 10px 30px rgba(0,0,0,0.1)",
              }}
            />

            <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#2E2E2E",
              }}
            >
              About Us
            </Typography>

            <Typography
              sx={{
                mt: 3,
                color: "#666",
                lineHeight: 1.8,
              }}
            >
              We believe that wholesome, nourishing food doesn't have to be
              complicated or boring. Our mission is to transform fresh, everyday
              ingredients into vibrant dishes that fuel your body and delight
              your taste buds. Whether you are following a specific diet or
              simply looking to add more balanced meals to your routine, we are
              here to support your healthy lifestyle journey.
            </Typography>
            </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default AboutUs;
