import React from "react";
import { Box, Typography, IconButton, Card, CardContent, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const TripDetails = ({ trip, onBack }) => {
  // Lấy stops từ routeData được truyền từ DriverSchedule
  const stops = trip.routeData?.stops || [];

  return (
    <Box sx={{}}>
      <Box sx={{ display: "flex",
          alignItems: "center",
          backgroundColor: "#2962ff",
          color: "#fff",
          p: 1,
          mb: 2,
        }}>
        <IconButton onClick={onBack} sx={{ color: "white" }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
          Chi tiết chuyến
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, mb: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <CardContent>
          <Typography fontWeight="bold">{trip.title}</Typography>
          <Typography variant="body2">🕐 {trip.time}</Typography>
          <Typography variant="body2">👥 {trip.students} học sinh</Typography>
          <Typography variant="body2">📍 {trip.stops} điểm dừng</Typography>
        </CardContent>
      </Card>

      <Typography variant="subtitle2" sx={{ mb: 1, ml: 2, fontWeight: 600 }}>
        Điểm dừng ({stops.length})
      </Typography>

      {stops.map((stop) => (
        <Card
          key={stop.stopId}
          sx={{
            borderRadius: 3,
            mb: 2,
            mx: 2,
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          <CardContent>
            <Box display="flex" justifyContent="space-between">
              <Typography fontWeight="bold">{stop.name}</Typography>
              <Typography variant="body2" color="primary">
                {stop.students?.length || 0} Học sinh
              </Typography>
            </Box>
            <Typography color="text.secondary" variant="body2">
              {stop.address}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default TripDetails;