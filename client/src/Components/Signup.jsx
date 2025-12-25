import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import axios from "axios";

import {
  Grid,
  Button,
  Paper,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Link,
  LinearProgress
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [strength, setStrength] = useState("");
  const [strengthValue, setStrengthValue] = useState(0);

  const navigate = useNavigate();

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 🔐 Password Strength Checker
  const checkPasswordStrength = (value) => {
    setPassword(value);

    if (value.length < 6) {
      setStrength("Weak");
      setStrengthValue(33);
      return;
    }

    if (
      value.length >= 6 &&
      /[A-Za-z]/.test(value) &&
      /\d/.test(value)
    ) {
      setStrength("Medium");
      setStrengthValue(66);
    }

    if (
      value.length >= 8 &&
      /[A-Z]/.test(value) &&
      /\d/.test(value) &&
      /[@$!%*?&]/.test(value)
    ) {
      setStrength("Strong");
      setStrengthValue(100);
    }
  };

  const strengthColor =
    strength === "Weak"
      ? "error"
      : strength === "Medium"
      ? "warning"
      : "success";

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/signup",
        { name, email, password },
        { withCredentials: true }
      );

      if (res.status === 201) {
        navigate("/login");
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setError("Email already exists");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container justifyContent="center" alignItems="center" minHeight="100vh">
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          width: { xs: "90%", sm: "400px" },
          borderRadius: 3
        }}
      >
        <Typography variant="h4" fontWeight="bold" textAlign="center">
          Sign Up
        </Typography>

        {error && (
          <Typography color="error" textAlign="center" mt={2}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSignup}>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            onChange={(e) => setName(e.target.value)}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Email"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type={showPassword ? "text" : "password"}
            onChange={(e) => checkPasswordStrength(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {password && (
            <>
              <LinearProgress
                variant="determinate"
                value={strengthValue}
                color={strengthColor}
                sx={{ mt: 1, height: 8, borderRadius: 5 }}
              />
              <Typography
                mt={1}
                fontSize="0.9rem"
                color={strengthColor}
              >
                Password Strength: {strength}
              </Typography>
            </>
          )}

          <Button
            fullWidth
            variant="contained"
            type="submit"
            sx={{ mt: 3, fontWeight: "bold" }}
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </Button>
        </form>

        <Typography textAlign="center" mt={2}>
          Already have an account?{" "}
          <Link component={RouterLink} to="/login">
            Login
          </Link>
        </Typography>
      </Paper>
    </Grid>
  );
}

export default SignUp;
