import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Avatar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const EditAccount = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: "Ho Thanh Thai",
    driverId: "D001",
    phone: "0909123456",
    email: "thaiho@gmail.com",
    avatar: "https://i.pravatar.cc/150?img=3",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    alert("✅ Thông tin đã được cập nhật!");
    console.log("Thông tin cập nhật:", formData);
  };

  return (
    <Box sx={{  }}>
      {/* Header */}
      <Box sx={{ display: "flex",
          alignItems: "center",
          backgroundColor: "#2962ff",
          color: "#fff",
          
          p: 1,
          mb: 2}}>
        <IconButton onClick={onBack} sx={{ color: "white" }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600, ml: 1, }}>
          Chỉnh sửa thông tin
        </Typography>
      </Box>

      {/* Avatar */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Avatar
          src={formData.avatar}
          alt={formData.name}
          sx={{
            width: 80,
            height: 80,
            margin: "auto",
            mb: 1,
            border: "2px solid #1976d2",
          }}
        />
        <Typography variant="body2" color="textSecondary">
          ID: {formData.driverId}
        </Typography>
      </Box>

      {/* Form Fields */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Họ và tên"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Số điện thoại"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
        />
        
      </Box>

      {/* Buttons */}
      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Button
          variant="contained"
          sx={{
            borderRadius: "20px",
            px: 4,
            py: 1,
            backgroundColor: "#1976d2",
            textTransform: "none",
          }}
          onClick={handleSave}
        >
          Lưu thay đổi
        </Button>
      </Box>
    </Box>
  );
};

export default EditAccount;
