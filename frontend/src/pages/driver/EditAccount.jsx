import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
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
    avatar:
      "https://i.pravatar.cc/150?img=3",
    licenseNumber: "B123456789",
    licensePlate: "29A-12345",
  });

  const fields = [
    { label: "Họ và tên", name: "name" },
    { label: "Số điện thoại", name: "phone" },
    { label: "Email", name: "email" },
    { label: "Số giấy phép lái xe", name: "licenseNumber" },
    { label: "Biển số xe", name: "licensePlate" },
  ];

  

  return (
    <Box >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#2962ff",
          color: "#fff",
          p: 1.2,
          mb: 2,
          borderRadius: 1,
        }}
      >
        <IconButton onClick={onBack} sx={{ color: "white" }}>
          {" "}
          <ArrowBackIcon />{" "}
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600, ml: 1 }}>
          Chỉnh sửa thông tin{" "}
        </Typography>{" "}
      </Box>

      {/* Avatar */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Avatar
          src={formData.avatar}
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
        {fields.map(({ label, name }) => (
          <TextField
            key={name}
            label={label}
            name={name}
            value={formData[name]}
            
            fullWidth
            InputProps={{ readOnly: true }}
          />
        ))}
      </Box>

      {/* Save Button */}
      
    </Box>
  );
};

export default EditAccount;
