import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TripDetails from "./TripDetails";

const HistoryRoute = ({ onBack }) => {
  const [selectedTrip, setSelectedTrip] = useState(null);

  const data = {
    trips: [
      {
        id: 1,
        title: "Chiều - 27 Tháng 9 2025",
        route: "120",
        time: "15:00 - 16:30",
        stops: 2,
        students: 4,
        status: "Hoàn thành",
        type: "Trả",
      },
      {   
        id: 2,
        title: "Sáng - 27 Tháng 9 2025",
        route: "120",
        time: "07:00 - 08:30",
        stops: 2,
        students: 4,
        status: "Hoàn thành",
        type: "Đón",
      },
      {
        id: 3,
        title: "Chiều - 26 Tháng 9 2025",
        route: "120",
        time: "15:00 - 16:30",
        stops: 2,
        students: 4,
        status: "Hoàn thành",
        type: "Đón",
      },
      {
        id: 4,
        title: "Sáng - 27 Tháng 9 2025",
        route: "120",
        time: "07:00 - 08:30",
        stops: 2,
        students: 4,
        status: "Hoàn thành",
        type: "Đón",
      },
    ],
  };

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
          Route History
        </Typography>
      </Box>

      
      {/* Past Trips */}
      <Typography variant="body2" sx={{ mb: 1, ml: 2 }}>
        Past Trips ({data.trips.length})
      </Typography>

      {/* Trip cards */}
      {data.trips.map((trip) => (
        <Card
          key={trip.id}
          sx={{
            mb: 2,
            borderRadius: "12px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            mx: 2,
            cursor: "pointer",
          }}
          onClick={() => setSelectedTrip(trip)}
        >
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography sx={{ fontWeight: 600 }}>{trip.title}</Typography>
              <Typography
                sx={{
                  backgroundColor: "#E0F2F1",
                  color: "#2E7D32",
                  borderRadius: "12px",
                  px: 1.5,
                  fontSize: "0.8rem",
                }}
              >
                {trip.status}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
              <Typography variant="body2 " sx={{ color: "#6f5c6c" }}>
                Tuyến 
              </Typography>
              <Typography variant="body2" sx={{ color: "#6f5c6c" }}>
                Điểm dừng 
              </Typography>
              <Typography variant="body2" sx={{ color: "#6f5c6c" }}>
                Học sinh 
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
              <Typography variant="body2">
                {trip.route}
              </Typography>
              <Typography variant="body2">
                {trip.stops}
              </Typography>
              <Typography variant="body2">
                {trip.students}/4
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {trip.time}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  mt: 1,
                  display: "inline-block",
                  color: trip.type === "Đón" ? "#6ba885" : "#3949AB",
                  fontWeight: 600,
                }}
              >
                {trip.type}
              </Typography>
            </Box> 

          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default HistoryRoute;
