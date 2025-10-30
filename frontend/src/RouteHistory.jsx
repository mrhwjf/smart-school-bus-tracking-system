// RouteHistory.jsx
import React from "react";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const sampleTrips = [
  {
    id: 1,
    title: "Afternoon Route A - Tue, Oct 21",
    from: "My house",
    to: "Đại học Sài Gòn",
    time: "7:00 - 8:30",
    status: "Complete",
  },
  {
    id: 2,
    title: "Afternoon Route A - Fri, Sep 27",
    from: "My house",
    to: "Museum",
    time: "15:00 - 16:30",
    status: "Complete",
  },
  {
    id: 3,
    title: "Afternoon Route A - Fri, Sep 27",
    from: "My house",
    to: "School but different branch",
    time: "15:00 - 16:30",
    status: "Progressing",
  },
  {
    id: 4,
    title: "Afternoon Route A - Fri, Sep 27",
    from: "My house",
    to: "School",
    time: "15:00 - 16:30",
    status: "Canceled",
  },
];

export default function RouteHistory() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fff" }}>
      <AppBar position="static" sx={{ bgcolor: "#1976d2" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate("/GDChinh")}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1 }}>
            Route History
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 2 }}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Past Trips ({sampleTrips.length})
        </Typography>

        {sampleTrips.map((trip) => (
          <Card
            key={trip.id}
            sx={{
              mb: 2,
              borderRadius: 2,
              boxShadow: "0 6px 14px rgba(15,23,36,0.06)",
              position: "relative",
              overflow: "visible",
            }}>
            <CardContent sx={{ p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>{trip.title}</Typography>
                  <Typography sx={{ mt: 1, fontSize: 13 }}>
                    From: {trip.from}
                  </Typography>
                  <Typography sx={{ fontSize: 13 }}>To: {trip.to}</Typography>
                  <Typography
                    sx={{ mt: 1, fontSize: 13, color: "text.secondary" }}>
                    {trip.time}
                  </Typography>
                </Box>

                <Chip
                  label={trip.status}
                  color={
                    trip.status === "Complete"
                      ? "success"
                      : trip.status === "Progressing"
                      ? "info"
                      : "error"
                  }
                />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Container>
    </Box>
  );
}
