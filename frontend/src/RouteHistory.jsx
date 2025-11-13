import React, { useMemo, useState } from "react";
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
  InputBase,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

// sample data now includes a proper ISO date field (yyyy-mm-dd) so the <input type="date"> works
const sampleTrips = [
  {
    id: 1,
    title: "Afternoon Route A - Tue, Oct 21",
    from: "My house",
    to: "Đại học Sài Gòn",
    time: "7:00 - 8:30",
    status: "Complete",
    date: "2025-10-21",
  },
  {
    id: 2,
    title: "Afternoon Route A - Fri, Sep 27",
    from: "My house",
    to: "Museum",
    time: "15:00 - 16:30",
    status: "Complete",
    date: "2025-09-27",
  },
  {
    id: 3,
    title: "Afternoon Route A - Fri, Sep 27",
    from: "My house",
    to: "School but different branch",
    time: "15:00 - 16:30",
    status: "Canceled",
    date: "2025-09-27",
  },
  {
    id: 4,
    title: "Afternoon Route A - Fri, Sep 27",
    from: "My house",
    to: "School",
    time: "15:00 - 16:30",
    status: "Canceled",
    date: "2025-09-27",
  },
];

export default function RouteHistory() {
  const navigate = useNavigate();
  const [filterDate, setFilterDate] = useState("");

  // derived filtered list
  const filteredTrips = useMemo(() => {
    if (!filterDate) return sampleTrips;
    return sampleTrips.filter((t) => t.date === filterDate);
  }, [filterDate]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fff" }}>
      <AppBar position="static" sx={{ bgcolor: "#1976d2" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate("/GDChinh")}
            aria-label="back">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1 }}>
            Route History
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Past Trips ({filteredTrips.length})
            </Typography>
            {filterDate && (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Showing trips on {new Date(filterDate).toLocaleDateString()}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}>
            {/* controlled date input */}
            <InputBase
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                px: 1,
                py: 0.5,
                cursor: "pointer",
              }}
              inputProps={{
                "aria-label": "filter by date",
              }}
            />
          </Box>
        </Box>

        {filteredTrips.map((trip) => (
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
                  gap: 4,
                  fontSize: "1.2rem",
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

                {trip.status === "Complete" ? (
                  <Chip label={trip.status} color="success" />
                ) : trip.status === "Canceled" ? (
                  <Chip label={trip.status} color="error" />
                ) : null}
              </Box>
            </CardContent>
          </Card>
        ))}

        {filteredTrips.length === 0 && (
          <Typography
            variant="body2"
            sx={{ textAlign: "center", mt: 4, color: "text.secondary" }}>
            No trips found for the selected date.
          </Typography>
        )}
      </Container>
    </Box>
  );
}
