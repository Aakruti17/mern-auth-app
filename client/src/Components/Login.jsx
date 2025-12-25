import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import { Grid, Button, Paper, TextField, Typography, Link } from "@mui/material";

function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/login",
        { email, password },
        { withCredentials: true }
      );

      if (res.data.message === "Success") {
        setIsLoggedIn(true);
        navigate("/home");
      } else {
        alert("Login failed");
      }
    } catch (err) {
      alert("Invalid email or password");
    }
  };

  return (
    <Grid align="center">
      <Paper
        sx={{
          p: 4,
          mt: 12,
          borderRadius: 2,
          width: { xs: "80vw", sm: "50vw", md: "35vw", lg: "28vw" }
        }}
      >
        <Typography variant="h4" fontWeight="600" gutterBottom>
          Login
        </Typography>

        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            margin="normal"
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            margin="normal"
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3, fontSize: "1rem", fontWeight: 600 }}
          >
            Login
          </Button>
        </form>

        <Typography mt={2}>
          Don&apos;t have an account?{" "}
          <Link component={RouterLink} to="/signup">
            Sign Up
          </Link>
        </Typography>
      </Paper>
    </Grid>
  );
}

export default Login;
