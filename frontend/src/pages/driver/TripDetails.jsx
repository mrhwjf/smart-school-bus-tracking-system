import React from "react";
import { Box, Typography, IconButton, Card, CardContent, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const TripDetails = ({ trip, onBack }) => {
  const stops = [
    { id: 1, name: "Stop 1", street: "Street name", students: 2 },
    { id: 2, name: "Stop 2", street: "Street name", students: 2 },
  ];

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
          <Typography variant="body2">Route {trip.route}</Typography>
          <Typography variant="body2">🕐 {trip.time}</Typography>
          <Typography variant="body2">👥 {trip.students} students</Typography>
        </CardContent>
      </Card>

      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Stops ({stops.length})
      </Typography>

      {stops.map((stop) => (
        <Card
          key={stop.id}
          sx={{
            borderRadius: 3,
            mb: 2,
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          <CardContent>
            <Box display="flex" justifyContent="space-between">
              <Typography fontWeight="bold">{stop.name}</Typography>
              <Typography variant="body2">{stop.students} Students</Typography>
            </Box>
            <Typography color="text.secondary">{stop.street}</Typography>
            
          </CardContent>
        </Card>
      ))}

      {/* <Button
        variant="contained"
        sx={{
          mt: 2,
          borderRadius: "20px",
          width: "100%",
          backgroundColor: "#1976d2",
        }}
      >
        Start Pickup Route
      </Button> */}
    </Box>
  );
};

export default TripDetails;
