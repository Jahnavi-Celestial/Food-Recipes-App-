import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import CreateRecipeModal from "./CreateRecipeModal";

export default function Navbar() {
  const { isAuthenticated, logoutUser } = useAuth();
  const navigate = useNavigate();

  const [authOpen, setAuthOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  return (
    <>
      <AppBar
        elevation={0}
        sx={{
          borderBottom: "1px solid #E0E0E0",
          bgcolor: "#FFFFFF",
          zIndex: 10000,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                textDecoration: "none",
                color: "#2E7D32",
                fontWeight: "800",
              }}
            >
              FOOD.CO
            </Typography>

            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
              <Button component={Link} to={"/"} sx={{ color: "#4F4F4F" }}>
                Home
              </Button>

              <Button component={Link} to={"/recipes"} sx={{ color: "#4F4F4F" }}>
                All Recipes
              </Button>

              <Button component={Link} to={"/tags"} sx={{ color: "#4F4F4F" }}>
                Tags
              </Button>

              {isAuthenticated && (
                <>
                  <Button
                    component={Link}
                    to={"/my-recipes"}
                    sx={{ color: "#4F4F4F" }}
                  >
                    My Recipes
                  </Button>
                  <Button
                    component={Link}
                    to={"/saved-recipes"}
                    sx={{ color: "#4F4F4F" }}
                  >
                    Saved Recipes
                  </Button>
                </>
              )}
            </Box>

            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1.5 }}>
              {isAuthenticated ? (
                <>
                  <Button
                    onClick={() => setCreateOpen(true)}
                    sx={{ bgcolor: "#2E7D32", color: "#fff" }}
                  >
                    Add Recipe
                  </Button>
                  <Button onClick={logoutUser} sx={{ color: "red" }}>
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setAuthOpen(true)}
                  sx={{ bgcolor: "#2E7D32", color: "#fff" }}
                >
                  Login
                </Button>
              )}
            </Box>

            <IconButton
              sx={{ display: { xs: "flex", md: "none" } }}
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="top"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: "100%",
            bgcolor: "#fff",
            borderBottomLeftRadius: 2,
            borderBottomRightRadius: 2,
            mt: "100px",
            boxShadow: 3,
          },
        }}
      >
        <Box sx={{ p: 3, pt: 5 }}>
          <List>
            <ListItem button onClick={() => {
                  navigate("/");
                  setDrawerOpen(false);
                }}>
              <ListItemText primary="Home" />
            </ListItem>

            <ListItem button onClick={() => {
                  navigate("/recipes");
                  setDrawerOpen(false);
                }}>
              <ListItemText primary="All Recipes" />
            </ListItem>

            <ListItem button onClick={() => {
                  navigate("/tags");
                  setDrawerOpen(false);
                }}>
              <ListItemText primary="Tags" />
            </ListItem>

            {isAuthenticated && (
              <>
                <ListItem button onClick={() => {
                  navigate("/my-recipes");
                  setDrawerOpen(false);
                }}>
                  <ListItemText primary="My Recipes" />
                </ListItem>

                <ListItem button onClick={() => {
                  navigate("/saved-recipes");
                  setDrawerOpen(false);
                }}>
                  <ListItemText primary="Saved Recipes" />
                </ListItem>
              </>
            )}
          </List>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {isAuthenticated ? (
              <>
                <Button
                  fullWidth
                  onClick={() => {
                    setCreateOpen(true);
                    setDrawerOpen(false);
                  }}
                  sx={{ bgcolor: "#2E7D32", color: "#fff" }}
                >
                  Add Recipe
                </Button>

                <Button
                  fullWidth
                  onClick={() => {
                    logoutUser();
                    setDrawerOpen(false);
                  }}
                  sx={{ color: "red" }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                fullWidth
                onClick={() => {
                  setAuthOpen(true);
                  setDrawerOpen(false);
                }}
                sx={{ bgcolor: "#2E7D32", color: "#fff" }}
              >
                Login
              </Button>
            )}
          </Box>
        </Box>
      </Drawer>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <CreateRecipeModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </>
  );
}
