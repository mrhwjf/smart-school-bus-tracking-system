import React, { useState } from "react";
import { Box, Typography, Card, CardContent, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TripDetails from "./TripDetails";

const tripsData = [
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
];

const HistoryRoute = ({ onBack }) => {
  const [selectedTrip, setSelectedTrip] = useState(null);

  if (selectedTrip)
    return (
      <TripDetails trip={selectedTrip} onBack={() => setSelectedTrip(null)} />
    );

  const renderTripCard = (trip) => (
    <Card
      key={trip.id}
      sx={{
        mb: 2,
        borderRadius: "10px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        mx: 2,
        cursor: "pointer",
        transition: "0.2s",
        "&:hover": { transform: "scale(1.01)" },
      }}
      onClick={() => setSelectedTrip(trip)}
    >
      {" "}
      <CardContent>
        {/* Title + Status */}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography sx={{ fontWeight: 600 }}>{trip.title}</Typography>
          <Typography
            sx={{
              backgroundColor: "#E0F2F1",
              color: "#2E7D32",
              borderRadius: "12px",
              px: 1.5,
              fontSize: "0.8rem",
              fontWeight: 600,
            }}
          >
            {trip.status}{" "}
          </Typography>{" "}
        </Box>

        {/* Labels */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 1,
            color: "#6f5c6c",
            fontSize: "0.85rem",
          }}
        >
          <span>Tuyến</span>
          <span>Điểm dừng</span>
          <span>Học sinh</span>
        </Box>

        {/* Values */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
          <span>{trip.route}</span>
          <span>{trip.stops}</span>
          <span>{trip.students}/4</span>
        </Box>

        {/* Time + Type */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <Typography variant="body2">{trip.time}</Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: trip.type === "Đón" ? "#6ba885" : "#3949AB",
            }}
          >
            {trip.type}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

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
          {" "}
          <ArrowBackIcon />{" "}
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600, ml: 1 }}>
          Lịch sử tuyến{" "}
        </Typography>{" "}
      </Box>

      <Typography variant="body2" sx={{ mb: 1, ml: 2 }}>
        Chuyến đã đi ({tripsData.length})
      </Typography>

      {tripsData.map(renderTripCard)}
    </Box>
  );
};

export default HistoryRoute;
