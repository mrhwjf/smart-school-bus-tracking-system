import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BuildIcon from "@mui/icons-material/Build";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import { sendAlert } from "../../service/notificationService";
import { getAllUsers } from "../../service/userService";

const SendAlert = ({ onBack }) => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const alerts = [
    { id: 1, label: "Tai nạn", icon: <DirectionsCarIcon sx={{ fontSize: 36 }} />, color: "#ffe5e5" },
    { id: 2, label: "Trễ", icon: <AccessTimeIcon sx={{ fontSize: 36 }} />, color: "#fff2e0" },
    { id: 3, label: "Vấn đề kỹ thuật", icon: <BuildIcon sx={{ fontSize: 36 }} />, color: "#f5e9ff" },
    { id: 4, label: "Khác", icon: <HelpOutlineIcon sx={{ fontSize: 36 }} />, color: "#f5f5f5" },
  ];

  const [selectedAlert, setSelectedAlert] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const result = await getAllUsers();
      if (result && result.success && result.data?.items) {
        const parentUsers = result.data.items.filter(user => user.role?.name === 'PARENT');
        setParents(parentUsers);
      }
    } catch (err) {
      console.error("Error fetching parents:", err);
    }
  };

  const handleAlertClick = (alertType) => {
    setSelectedAlert(alertType);
    setConfirmOpen(true);
  };

  const handleSendConfirm = async () => {
    setLoading(true);
    setError("");
    
    try {
      const alertTypeMap = {
        "Tai nạn": "ALERT",
        "Trễ": "WARNING",
        "Vấn đề kỹ thuật": "WARNING",
        "Khác": "INFO",
      };

      const recipientIds = parents.map(p => p.userId);
      
      await sendAlert({
        messageText: `Cảnh báo: ${selectedAlert}`,
        type: alertTypeMap[selectedAlert] || "INFO",
        latitude: 0,
        longitude: 0,
        recipientIds,
      });

      setConfirmOpen(false);
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 3000);
    } catch (err) {
      setError(err.message || "Gửi cảnh báo thất bại");
      setConfirmOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: 414,
        height: 896,
        margin: "0 auto",
        
        overflow: "hidden",
        boxShadow: 3,
        bgcolor: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 🔴 HEADER */}
      <Box
        sx={{
          bgcolor: "error.main",
          display: "flex",
          alignItems: "center",
          color: "#fff",
          p: 1,
          mb: 2,
        }}
      >
        <IconButton onClick={onBack} sx={{ color: "white" }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600, ml: 1 }}>
          Gửi cảnh báo
        </Typography>
      </Box>

      {/* ⚙️ MAIN CONTENT */}
      <Box sx={{ p: 3, flex: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Select Alert Type
        </Typography>

        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          {alerts.map((item) => (
            <Grid item size={6} key={item.id}>
              <Paper
                elevation={2}
                onClick={() => handleAlertClick(item.label)}
                sx={{
                  textAlign: "center",
                  py: 3,
                  borderRadius: 3,
                  cursor: "pointer",
                  bgcolor: item.color,
                  "&:hover": { boxShadow: 4 },
                }}
              >
                {item.icon}
                <Typography sx={{ mt: 1, fontWeight: 500 }}>
                  {item.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* ⚠️ WARNING NOTE */}
        <Alert
          severity="info"
          sx={{
            mt: 3,
            borderRadius: 2,
            fontSize: "0.85rem",
            bgcolor: "#e3f2fd",
            color: "#0d47a1",
          }}
        >
          <strong>Quan trọng:</strong> Cảnh báo khẩn cấp được gửi ngay lập tức đến
          trung tâm điều phối và sẽ kích hoạt phản ứng ngay lập tức. Chỉ sử dụng cho
          các tình huống khẩn cấp thực sự.
        </Alert>
      </Box>

      {/* 🧩 XÁC NHẬN GỬI CẢNH BÁO */}
      {/* 🧩 XÁC NHẬN GỬI CẢNH BÁO - Dialog nhỏ gọn như hình 2 */}
<Dialog
  open={confirmOpen}
  onClose={() => setConfirmOpen(false)}
  PaperProps={{
    sx: {
      width: 300,
      borderRadius: 3,
      boxShadow: 6,
      m: 0,
      maxWidth: "90%",
    },
  }}
>
  <Box sx={{ position: "relative", p: 2 }}>
    {/* Nút X đóng */}
    <IconButton
      onClick={() => setConfirmOpen(false)}
      sx={{ position: "absolute", right: 8, top: 8 }}
    >
      <CloseIcon />
    </IconButton>

    <DialogTitle sx={{ textAlign: "center", pb: 0, fontWeight: 600 }}>
      Xác nhận gửi cảnh báo
    </DialogTitle>

    <DialogContent sx={{ textAlign: "center", py: 2 }}>
      <Typography>
        Bạn có chắc chắn muốn gửi cảnh báo <strong>{selectedAlert}</strong> không?
      </Typography>
    </DialogContent>

    <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 2 }}>
      <Button
        variant="outlined"
        onClick={() => setConfirmOpen(false)}
        sx={{ minWidth: 100 }}
      >
        Hủy
      </Button>
      <Button
        variant="contained"
        color="error"
        onClick={handleSendConfirm}
        disabled={loading}
        sx={{ minWidth: 120 }}
      >
        {loading ? "Đang gửi..." : "Gửi cảnh báo"}
      </Button>
    </DialogActions>
  </Box>
</Dialog>

{/* ✅ THÔNG BÁO GỬI THÀNH CÔNG - Dialog nhỏ gọn */}
<Dialog
  open={successOpen}
  onClose={() => setSuccessOpen(false)}
  PaperProps={{
    sx: {
      width: 300,
      borderRadius: 3,
      boxShadow: 6,
      m: 0,
      maxWidth: "90%",
    },
  }}
>
  <Box sx={{ textAlign: "center", py: 4, px: 3 }}>
    <CheckCircleOutlineIcon sx={{ fontSize: 50, color: "success.main" }} />
    <Typography variant="h6" sx={{ mt: 2, fontWeight: 600, color: "success.main" }}>
      Đã gửi cảnh báo thành công
    </Typography>
    <Typography sx={{ mt: 1, fontSize: "0.9rem", color: "text.secondary" }}>
      Cảnh báo của bạn đã được gửi đến trung tâm điều phối. Hỗ trợ đang trên đường đến.
    </Typography>
  </Box>
</Dialog>
    </Box>
  );
};

export default SendAlert;