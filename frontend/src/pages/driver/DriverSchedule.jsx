import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TripDetails from "./TripDetails";

const DriverWorkSchedule = ({ onBack }) => {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Hàm chuyển ngày
  const changeDate = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + days);
    setCurrentDate(newDate);
  };

  // Format ngày
  const formatDate = (date) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
  };

  const formatDayLabel = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Hôm nay";
    if (date.toDateString() === tomorrow.toDateString()) return "Ngày mai";
    return formatDate(date);
  };

  // Dữ liệu mẫu theo ngày
  const getTripsByDate = (date) => {
    const trips = {
      // Ngày 29/9
      "2025-11-11": [
        {
          id: 1,
          title: "Buổi Sáng Tuyến A",
          route: "120",
          time: "07:00 - 08:30",
          students: 4,
          stops: 2,
          type: "Pickup",
          
        },
        {
          id: 2,
          title: "Buổi Chiều Tuyến A",
          route: "120",
          time: "15:00 - 16:30",
          students: 4,
          stops: 2,
          type: "Drop",
          
        },
      ],
      // Ngày 30/9
      "2025-09-30": [
        {
          id: 3,
          title: "Buổi Sáng Tuyến B",
          route: "130",
          time: "06:45 - 08:15",
          students: 6,
          stops: 3,
          type: "Pickup",
          
        },
      ],
    };

    const key = date.toISOString().split('T')[0];
    return trips[key] || [];
  };

  const trips = getTripsByDate(currentDate);



  if (selectedTrip) {
    return <TripDetails trip={selectedTrip} onBack={() => setSelectedTrip(null)} />;
  }

  return (
    <Box>
      {/* Header */}
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
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600, ml: 1 }}>
          Lịch làm việc
        </Typography>
      </Box>

      {/* Ngày + Điều hướng */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, px: 2 }}>
        <IconButton onClick={() => changeDate(-1)}>
          <ChevronLeftIcon />
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", flex: 1, justifyContent: "center" }}>
          <CalendarTodayIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {formatDayLabel(currentDate)}
          </Typography>
        </Box>

        <IconButton onClick={() => changeDate(1)}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Tổng số chuyến */}
      <Typography variant="body2" sx={{ mb: 1, ml: 2 }}>
        Tổng số chuyến: {trips.length}
      </Typography>

      {/* Danh sách chuyến */}
      {trips.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 4, color: "gray" }}>
          <Typography>Không có chuyến nào trong ngày này</Typography>
        </Box>
      ) : (
        trips.map((trip) => {
          
          return (
            <Card
              key={trip.id}
              sx={{
                mb: 2,
                mx: 2,
                borderRadius: "12px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                
              }}
              onClick={() => setSelectedTrip(trip)}
            >
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography sx={{ fontWeight: 600 }}>{trip.title}</Typography>
                </Box>

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
        })
      )}
    </Box>
  );
};

export default DriverWorkSchedule;