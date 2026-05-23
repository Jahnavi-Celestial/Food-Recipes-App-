import { Box, Container, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      sx={{
        bgcolor: "#E8F5E9",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          sx={{
            textAlign: "center",
            color: "#2E7D32",
            fontWeight: 600,
          }}
        >
          &copy; 2026 FOOD.CO 
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
