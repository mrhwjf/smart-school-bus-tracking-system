import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Paper,
} from "@mui/material";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Login = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [driverId, setDriverId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (driverId === "D001" && password === "123456") {
      onLogin();
    } else {
      alert("Sai thông tin đăng nhập!");
    }
  };

  return (
    <Box
      sx={{
        width: "414px",
        height: "896px",
        margin: "auto",
        backgroundColor: "#2979FF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
      }}
    >
      {/* Logo + Title */}
      <DirectionsBusIcon sx={{ fontSize: 70, mb: 1 }} />
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        BUS TRUCKER
      </Typography>
      <Typography variant="body2" sx={{ mb: 4 }}>
        Driver Portal
      </Typography>

      {/* Login form */}
      <Paper
        elevation={3}
        sx={{
          width: "80%",
          padding: "24px 20px",
          borderRadius: "16px",
          backgroundColor: "#fff",
          color: "#000",
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Driver ID
        </Typography>
        <TextField
          fullWidth
          placeholder="Enter your driver ID"
          value={driverId}
          onChange={(e) => setDriverId(e.target.value)}
          size="small"
          sx={{
            mb: 2,
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
          }}
        />

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Password
        </Typography>
        <TextField
          fullWidth
          placeholder="Enter your password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          size="small"
          sx={{
            mb: 3,
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
          }}
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
            ),
          }}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          sx={{
            backgroundColor: "#82B1FF",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1rem",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "#448AFF",
            },
          }}
        >
          Login
        </Button>
      </Paper>
    </Box>
  );
};

export default Login;
