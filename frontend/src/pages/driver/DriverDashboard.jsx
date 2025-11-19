import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ScheduleIcon from "@mui/icons-material/Schedule";
import HistoryIcon from "@mui/icons-material/History";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";

// IMPORT ĐÚNG
import DriverSchedule from "./DriverSchedule";
import EditAccount from "./EditAccount";
import PickUpMap from "./PickUpMap";
import HistoryRoute from "./HistoryRoute"; // ĐÃ THÊM

const DriverDashboard = () => {
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState("dashboard"); // dashboard | schedule | edit | pickup | history

  const data = {
    name: "Ho Thanh Thai",
    driverId: "D001",
    busNo: "115",
    routeNo: "120",
    totalStops: 2,
    totalStudents: 4,
    avatar: "https://i.pravatar.cc/150?img=3",
  };

  // CALLBACK KHI HOÀN THÀNH CHUYẾN
  const handleTripComplete = () => {
    setScreen("dashboard");
  };

  // MENU ITEMS
  const menuItems = [
    {
      text: "Thời gian biểu",
      icon: <ScheduleIcon color="primary" />,
      action: () => {
        setScreen("schedule");
        setOpen(false);
      },
    },
    {
      text: "Lịch sử tuyến",
      icon: <HistoryIcon color="primary" />,
      action: () => {
        setScreen("history");
        setOpen(false);
      },
    },
    {
      text: "Chỉnh sửa thông tin",
      icon: <EditIcon color="primary" />,
      action: () => {
        setScreen("edit");
        setOpen(false);
      },
    },
    {
      text: "Đăng xuất",
      icon: <LogoutIcon color="error" />,
      action: () => {
        if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
          alert("Đăng xuất thành công!");
          // Xử lý logout thực tế ở đây
        }
      },
    },
  ];



  // RENDER DASHBOARD CHÍNH
  const renderDashboard = () => (
    <>
      {/* Header */}
      <Box
        sx={{
          backgroundColor: "#2962ff",
          height: "240px",
          color: "white",
          position: "relative",
          textAlign: "center",
          pt: "40px",
        }}
      >
        <IconButton
          onClick={() => setOpen(true)}
          sx={{ position: "absolute", top: 12, right: 12, color: "white" }}
        >
          <MenuIcon />
        </IconButton>

        <Avatar
          src={data.avatar}
          alt={data.name}
          sx={{
            width: 80,
            height: 80,
            mx: "auto",
            border: "4px solid white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        />

        <Typography sx={{ mt: 1, fontWeight: 600, fontSize: "1.2rem" }}>
          {data.name}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          ID: {data.driverId}
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Box sx={{ p: 2, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        {[
          { label: "Xe buýt", value: data.busNo, color: "#2962ff" },
          { label: "Tuyến", value: data.routeNo, color: "#2962ff" },
          { label: "Điểm dừng", value: data.totalStops, color: "#000" },
          { label: "Học sinh", value: data.totalStudents, color: "#000" },
        ].map((item, i) => (
          <Card
            key={i}
            elevation={2}
            sx={{
              borderRadius: 3,
              textAlign: "center",
              py: 1,
            }}
          >
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "1.3rem",
                  color: item.color,
                }}
              >
                {item.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Nút bắt đầu */}
      <Box sx={{ px: 3, mt: 4 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => setScreen("pickup")}
          sx={{
            py: 1.8,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1.1rem",
            background: "linear-gradient(135deg, #00E676 0%, #1DE9B6 100%)",
            boxShadow: "0 6px 16px rgba(0, 230, 118, 0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #00C853 0%, #00C853 100%)",
            },
          }}
        >
          Sẵn sàng đón
        </Button>
      </Box>
    </>
  );

  return (
    <Box
      sx={{
        width: 414,
        height: 896,
        mx: "auto",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 0 20px rgba(0,0,0,0.15)",
        bgcolor: "#fff",
        position: "relative",
      }}
    >
      {/* OVERLAY để click ra ngoài đóng sidebar */}
      {open && (
        <Box
          onClick={() => setOpen(false)}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            bgcolor: "rgba(0,0,0,0.25)",
            backdropFilter: "blur(1px)",
            transition: "opacity 0.3s",
            zIndex: 999, // thấp hơn sidebar (9999) nhưng cao hơn nội dung
          }}
        />
      )}
      {/* NỘI DUNG CHÍNH */}
      {screen === "dashboard" && renderDashboard()}
      {screen === "schedule" && <DriverSchedule onBack={() => setScreen("dashboard")} />}
      {screen === "edit" && <EditAccount onBack={() => setScreen("dashboard")} />}
      {screen === "history" && <HistoryRoute onBack={() => setScreen("dashboard")} />}
      
      {/* PickUpMap: DÙNG onTripComplete */}
      {screen === "pickup" && (
        <PickUpMap onTripComplete={handleTripComplete} />
      )}

      {/* SIDEBAR MENU */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: open ? 0 : "-240px",
          width: 240,
          height: "100%",
          bgcolor: "white",
          boxShadow: "-6px 0 16px rgba(0,0,0,0.2)",
          transition: "right 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 9999, 
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            bgcolor: "#f8f9fa",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#2962ff" }}>
            MENU
          </Typography>
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List sx={{ pt: 1 }}>
          {menuItems.map((item, i) => (
            <ListItem key={i} disablePadding>
              <ListItemButton
                onClick={item.action}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  "&:hover": { bgcolor: "#e3f2fd" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default DriverDashboard;