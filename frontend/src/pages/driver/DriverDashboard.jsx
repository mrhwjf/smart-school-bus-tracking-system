import React, { useState, useEffect } from "react";
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
  CircularProgress,
  Alert,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ScheduleIcon from "@mui/icons-material/Schedule";
import HistoryIcon from "@mui/icons-material/History";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";

import DriverSchedule from "./DriverSchedule";
import EditAccount from "./EditAccount";
import PickUpMap from "./PickUpMap";
import HistoryRoute from "./HistoryRoute";

import { getUserById } from "../../service/userService";
import { getBusById } from "../../service/busService";

const DriverDashboard = () => {
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState("dashboard");
  
  // State cho dữ liệu từ API
  const [driverData, setDriverData] = useState(null);
  const [busData, setBusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // TODO: Thay bằng driverId thực từ session khi có đăng nhập
  const DRIVER_ID = 2; // Dùng ID test từ database (Trần Văn Tài)
  const BUS_ID = 1; // Bus của driver ID 2 (từ database: buses.driver_id = 2 → busId = 1)

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchDriverData();
  }, []);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Gọi getUserById để lấy thông tin đầy đủ (bao gồm driverInfo)
      const userResult = await getUserById(DRIVER_ID);
      
      if (!userResult || !userResult.success || !userResult.data) {
        setError("Không thể tải thông tin tài xế");
        return;
      }

      setDriverData(userResult.data);
      

      // 2. Gọi getBusById để lấy thông tin xe buýt (plateNumber, model)
      const busResult = await getBusById(BUS_ID);
      
      if (busResult && busResult.success && busResult.data) {
        setBusData(busResult.data);
      }

    } catch (err) {
      
      setError("Lỗi kết nối. Vui lòng kiểm tra backend đang chạy.");
    } finally {
      setLoading(false);
    }
  };

  const handleTripComplete = () => {
    setScreen("dashboard");
    fetchDriverData(); // Refresh dữ liệu sau khi hoàn thành chuyến
  };  

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

  // Xử lý dữ liệu hiển thị từ API response
  const displayData = driverData ? {
    name: driverData.name || 'N/A',
    avatar: '/default-avatar.png',
    plateNumber: busData?.plateNumber || 'N/A',
  } : null;

  const screens = {
    dashboard: (
      loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={fetchDriverData}>
            Thử lại
          </Button>
        </Box>
      ) : (
        <DashboardHome
          data={displayData}
          onStart={() => setScreen("pickup")}
        />
      )
    ),
    schedule: <DriverSchedule onBack={() => setScreen("dashboard")} />,
    edit: (driverData && busData) ? (
      <EditAccount onBack={() => setScreen("dashboard")} driverData={driverData} busData={busData} />
    ) : (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    ),
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

const DashboardHome = ({ data, onStart }) => {
  const stats = [
    { label: "Xe buýt", value: data.plateNumber, color: "#2962ff" },
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
        
      </Box>
      
      {/* THÔNG BÁO CÔNG VIỆC HÔM NAY */}
      {/* <Card
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
              Xem lịch trình trong "Thời gian biểu"
            </Typography>
          </Box>
        </CardContent>
      </Card> */}


      <Box
        sx={{
          p: 2,
          display: "grid",
          gridTemplaterRows: "1fr 1fr",
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