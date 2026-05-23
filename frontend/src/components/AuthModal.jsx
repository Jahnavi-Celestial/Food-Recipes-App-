import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { useMutation } from "@apollo/client/react";
import { Login, Register, GoogleLoginMutation } from "../GraphQl/mutation";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

export default function AuthModal({ open, onClose }) {
  const { loginUser } = useAuth();
  const [isRegistered, setIsRegistered] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const [loginAction] = useMutation(Login, {
    onCompleted: (data) => {
      if (data.login !== "") {
        loginUser(data.login, { email: formData.email });
        onClose();
      }
      else{
        alert("Invalid credentials or user not exist")
      }
    },
    onError: (error) => {
      alert(error.message || "Login failed");
      onClose();
    },
  });

  const [registerAction] = useMutation(Register, {
    onCompleted: (data) => {
        if(data.register !== ""){
            alert("Registered successfully!");
            setIsRegistered(true);
        }
        else{
            alert("User already exist pls login")
        }
    },
    onError: (error) => {
      alert(error.message || "Registration failed");
    },
  });

  const [googleLoginAction] = useMutation(GoogleLoginMutation, {
    onCompleted: (data) => {
      if (data?.googleLogin) {
        loginUser(data.googleLogin, { email: formData.email });
        onClose();
      }
    },
    onError: (error) => {
      alert(error.message || "Google login failed");
    },
  });

  const handleSubmit = () => {
  if (!formData.email || !formData.password || (!isRegistered && !formData.name)) {
    alert("Please fill all required fields");
    return;
  }
  if (isRegistered) {
    loginAction({
      variables: { email: formData.email, password: formData.password },
    });
  } else {
    registerAction({
      variables: {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      },
    });
  }
};

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: "700", pb: 1 }}>
        {isRegistered ? "Sign In" : "Create Account"}
      </DialogTitle>
      <DialogContent>
        <Box display="flex" gap={2} sx={{ mt: 1 }}>
          {!isRegistered && (
            <TextField
              label="Full Name"
              size="small"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          )}
          <TextField
            label="Email Address"
            type="email"
            size="small"
            fullWidth
            sx={{my: 2}}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField
            label="Password"
            type="password"
            size="small"
            fullWidth
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{ mt: 2, mb: 1, cursor: "pointer", color: "#2E7D32", fontWeight: "500" }}
          onClick={() => setIsRegistered(!isRegistered)}
        >
          {isRegistered ? "Create an account" : "Already registered? Click here"}
        </Typography>

        <Divider sx={{ my: 2 }}>OR</Divider>

        <GoogleLogin
          onSuccess={(credentialResponse) => {
            if (!credentialResponse.credential) {
              return 
            }
            googleLoginAction({ variables: { idToken: credentialResponse.credential } });
          }}
          onError={() => alert("Google Login Failed")}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disableElevation
          onClick={handleSubmit}
          sx={{
            bgcolor: "#2E7D32",
            "&:hover": { bgcolor: "#1B5E20" },
            textTransform: "none",
            px: 3,
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}