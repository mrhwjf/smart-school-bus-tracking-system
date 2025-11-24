import React, { useState } from "react";
import { Box, Typography, Card, CardContent, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TripDetails from "./TripDetails";

// ================================
// DỮ LIỆU MẪU (CÓ THỂ LẤY TỪ API SAU NÀY)
// ================================
const TRIPS_DATA = {
  "2025-11-24": [
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
  ],
  "2025-11-25": [
    {
      id: 3,
      title: "Buổi Sáng - Tuyến B",
      route: "130",
      time: "06:45 - 08:15",
      students: 6,
      stops: 3,
      type: "Pickup",
    },
  ],
  "2025-11-26": [
    {
      id: 4,
      title: "Buổi Sáng - Tuyến A",
      route: "120",
      time: "07:00 - 08:30",
      students: 5,
      stops: 2,
      type: "Pickup",
    },
    {
      id: 5,
      title: "Buổi Chiều - Tuyến B",
      route: "130",
      time: "15:00 - 16:30",
      students: 6,
      stops: 3,
      type: "Drop",
    },
  ],
};

// ================================
// HÀM FORMAT NGÀY
// ================================
const formatDateVN = (date) =>
  date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatDayLabel = (date) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Hôm nay";
  if (date.toDateString() === tomorrow.toDateString()) return "Ngày mai";

  return formatDateVN(date);
};

// ================================
// COMPONENT
// ================================
const DriverWorkSchedule = ({ onBack }) => {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const changeDate = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const key = currentDate.toISOString().split("T")[0];
  const trips = TRIPS_DATA[key] || [];

  // Nếu đã chọn 1 chuyến
  if (selectedTrip)
    return (
      <TripDetails trip={selectedTrip} onBack={() => setSelectedTrip(null)} />
    );

  // Render mỗi trip
  const renderTripCard = (trip) => (
    <Card
      key={trip.id}
      sx={{
        mb: 2,
        mx: 2,
        borderRadius: "12px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        cursor: "pointer",
        transition: "0.2s",
        "&:hover": { transform: "scale(1.01)" },
      }}
      onClick={() => setSelectedTrip(trip)}
    >
      {" "}
      <CardContent>
        <Typography sx={{ fontWeight: 600 }}>{trip.title}</Typography>

        <Typography variant="body2" sx={{ mt: 0.5 }}>
          Tuyến {trip.route}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <Typography variant="body2">Thời gian: {trip.time}</Typography>
          <Typography variant="body2">Học sinh: {trip.students}</Typography>
        </Box>

        <Typography variant="caption" sx={{ color: "gray" }}>
          {trip.stops} điểm dừng
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#2962ff",
          color: "#fff",
          p: 1,
          mb: 2,
        }}
      >
        <IconButton onClick={onBack} sx={{ color: "white" }}>
          {" "}
          <ArrowBackIcon />{" "}
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600, ml: 1 }}>
          Lịch làm việc{" "}
        </Typography>{" "}
      </Box>

      {/* ĐIỀU HƯỚNG NGÀY */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          px: 2,
        }}
      >
        <IconButton onClick={() => changeDate(-1)}>
          <ChevronLeftIcon />
        </IconButton>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <CalendarTodayIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {formatDayLabel(currentDate)}
          </Typography>
        </Box>

        <IconButton onClick={() => changeDate(1)}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* COUNT */}
      <Typography variant="body2" sx={{ mb: 1, ml: 2 }}>
        Tổng số chuyến: {trips.length}
      </Typography>

      {/* DANH SÁCH CHUYẾN */}
      {trips.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 4, color: "gray" }}>
          <Typography>Không có chuyến nào trong ngày này</Typography>
        </Box>
      ) : (
        trips.map(renderTripCard)
      )}
    </Box>
  );
};

export default DriverWorkSchedule;
