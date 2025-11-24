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
import WorkIcon from "@mui/icons-material/Work"; // Icon mới cho công việc

import DriverSchedule from "./DriverSchedule"; // Giả định component này chứa TRIPS_DATA
import EditAccount from "./EditAccount";
import PickUpMap from "./PickUpMap";
import HistoryRoute from "./HistoryRoute";

const DRIVER_INFO = {
  name: "Ho Thanh Thai",
  driverId: "D001",
  busNo: "115",
  routeNo: "120",
  totalStops: 2,
  totalStudents: 4,
  avatar: "https://i.pravatar.cc/150?img=3",
};

// Dữ liệu mẫu (Lấy từ TRIPS_DATA của DriverSchedule - giả định hôm nay là 2025-11-24)
// Tốt nhất nên fetch ngày hiện tại, nhưng ở đây dùng dữ liệu cứng để đảm bảo kết quả
const TODAY_TRIPS_DATA = [
    {
      id: 1,
      title: "Buổi Sáng - Tuyến A",
      route: "120",
      time: "07:00 - 08:30",
      students: 4,
      stops: 2,
      type: "Pickup",
    },
    {
      id: 2,
      title: "Buổi Chiều - Tuyến A",
      route: "120",
      time: "15:00 - 16:30",
      students: 4,
      stops: 2,
      type: "Drop",
    },
];
// Số chuyến hôm nay
const todayTripCount = TODAY_TRIPS_DATA.length;


const DriverDashboard = () => {
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState("dashboard");

  const handleTripComplete = () => setScreen("dashboard");

  const menuItems = [
    {
      text: "Thời gian biểu",
      icon: <ScheduleIcon color="primary" />,
      screen: "schedule",
    },
    {
      text: "Lịch sử tuyến",
      icon: <HistoryIcon color="primary" />,
      screen: "history",
    },
    {
      text: "Thông tin cá nhân",
      icon: <EditIcon color="primary" />,
      screen: "edit",
    },
    {
      text: "Đăng xuất",
      icon: <LogoutIcon color="error" />,
      action: () => {
        if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
          alert("Đăng xuất thành công!");
        }
      },
    },
  ];

  const screens = {
    dashboard: (
      <DashboardHome
        data={DRIVER_INFO}
        todayTripCount={todayTripCount} // Truyền số chuyến hôm nay vào
        onStart={() => setScreen("pickup")}
      />
    ),
    schedule: <DriverSchedule onBack={() => setScreen("dashboard")} />,
    edit: <EditAccount onBack={() => setScreen("dashboard")} />,
    history: <HistoryRoute onBack={() => setScreen("dashboard")} />,
    pickup: <PickUpMap onTripComplete={handleTripComplete} />,
  };

  return (
    <Box
      sx={{
        width: 414,
        height: 896,
        mx: "auto",
        overflow: "hidden",
        boxShadow: "0 0 20px rgba(0,0,0,0.15)",
        bgcolor: "#fff",
        position: "relative",
      }}
    >
      {open && <Overlay onClose={() => setOpen(false)} />}
      
      {screens[screen]}
      <Sidebar open={open} onClose={() => setOpen(false)}>
        <List sx={{ pt: 1 }}>
          {menuItems.map((item, i) => (
            <ListItem key={i} disablePadding>
              <ListItemButton
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  "&:hover": { bgcolor: "#e3f2fd" },
                }}
                onClick={() => {
                  if (item.action) return item.action();
                  setScreen(item.screen);
                  setOpen(false);
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Sidebar>
      <IconButton
        onClick={() => setOpen(true)}
        sx={{
          display: screen === "dashboard" ? "block" : "none",
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 50,
          color: "white",
        }}
      >
        <MenuIcon />
      </IconButton>
    </Box>
  );
};

/* ---------------- COMPONENT TÁCH RIÊNG ---------------- */

const Overlay = ({ onClose }) => (
  <Box
    onClick={onClose}
    sx={{
      position: "absolute",
      inset: 0,
      bgcolor: "rgba(0,0,0,0.25)",
      backdropFilter: "blur(1px)",
      zIndex: 999,
    }}
  />
);

const Sidebar = ({ open, onClose, children }) => (
  <Box
    sx={{
      position: "absolute",
      top: 0,
      right: open ? 0 : "-240px",
      width: 240,
      height: "100%",
      bgcolor: "white",
      boxShadow: "-6px 0 16px rgba(0,0,0,0.2)",
      transition: "right 0.35s",
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
      <IconButton onClick={onClose} size="small">
        <CloseIcon />
      </IconButton>
    </Box>
    <Divider />
    {children}
  </Box>
);

const DashboardHome = ({ data, onStart, todayTripCount }) => {
  const stats = [
    { label: "Xe buýt", value: data.busNo, color: "#2962ff" },
    { label: "Tuyến", value: data.routeNo, color: "#2962ff" },
    { label: "Điểm dừng", value: data.totalStops },
    { label: "Học sinh", value: data.totalStudents },
  ];

  return (
    <>
      <Box
        sx={{
          backgroundColor: "#2962ff",
          height: "240px",
          color: "white",
          textAlign: "center",
          pt: 4,
        }}
      >
        <Avatar
          src={data.avatar}
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
        <Typography variant="caption">ID: {data.driverId}</Typography>
      </Box>
      
      {/* THÔNG BÁO CÔNG VIỆC HÔM NAY */}
      <Card
        elevation={4}
        sx={{
          mx: 2,
          mt: -11, // Nâng card lên trên nền xanh
          borderRadius: 3,
          bgcolor: "#fff",
          position: "relative",
          zIndex: 10,
        }}
      >
        <CardContent sx={{ display: "flex", alignItems: "center", py: 1 }}>
          <WorkIcon sx={{ color: "#ff9800", fontSize: 30, mr: 2 }} />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Công việc hôm nay:
            </Typography>
            <Typography sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
              Bạn có {todayTripCount} chuyến .
            </Typography>
          </Box>
        </CardContent>
      </Card>


      <Box
        sx={{
          p: 2,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 2,
        }}
      >
        {stats.map((s, i) => (
          <Card
            key={i}
            elevation={2}
            sx={{ borderRadius: 3, textAlign: "center" }}
          >
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                {s.label}
              </Typography>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "1.3rem",
                  color: s.color || "#000",
                }}
              >
                {s.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ px: 3, mt: 4 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={onStart}
          sx={{
            py: 1.8,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1.1rem",
            background: "linear-gradient(135deg, #00E676 0%, #1DE9B6 100%)",
            boxShadow: "0 6px 16px rgba(0, 230, 118, 0.3)",
          }}
        >
          Sẵn sàng đón
        </Button>
      </Box>
    </>
  );
};

export default DriverDashboard;