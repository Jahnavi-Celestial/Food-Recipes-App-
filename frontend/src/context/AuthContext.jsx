import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null,
  );
  const [userId, setUserId] = useState(null);

  const loginUser = (userToken, userData) => {
    localStorage.setItem("token", userToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    window.location.href = "/";
  };

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
      } catch (err) {
        console.log("Failed to decode token", err);
      }
    }
  },[token]);

  return (
    <AuthContext.Provider
      value={{ token, user, loginUser, logoutUser, isAuthenticated: token, userId }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
