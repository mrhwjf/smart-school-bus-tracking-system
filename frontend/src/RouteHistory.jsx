// src/RouteHistory.jsx
import React, { useMemo, useState, useEffect } from "react";
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
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { getPickupRecordsByParentId } from "./services/pickupRecordService";

const toLocalDateString = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * RouteHistory (Pickup Records)
 * - load pickup records
 * - group by tripId
 * - derive tripDate from recordedAt (first record) if tripDate not provided
 * - filter by date input (yyyy-mm-dd)
 */

export default function RouteHistory() {
  const navigate = useNavigate();
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState([]); // [{ tripId, tripDate, records: [...] }]

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const parentId = Number(JSON.parse(localStorage.getItem("authUser")).user.user_id);
        const res = await getPickupRecordsByParentId(parentId);
        const items = res?.data ?? [];
        // build groups keyed by tripId
        const map = new Map();
        items.forEach((rec) => {
          const tripId = rec?.trip?.tripId ?? "unknown";
          if (!map.has(tripId)) {
            map.set(tripId, { tripId, records: [] });
          }
          map.get(tripId).records.push(rec);
        });

        // convert map to array, sort records by recordedAt asc, derive tripDate
        const arr = Array.from(map.values()).map((g) => {
          const recs = (g.records || []).slice().sort((a, b) => {
            const ta = a?.recordedAt ? new Date(a.recordedAt).getTime() : 0;
            const tb = b?.recordedAt ? new Date(b.recordedAt).getTime() : 0;
            return ta - tb;
          });
          // Derive tripDate from first record that has recordedAt (YYYY-MM-DD in local timezone)
          const firstWithDate = recs.find((record) => toLocalDateString(record?.recordedAt));
          const tripDate = firstWithDate ? toLocalDateString(firstWithDate.recordedAt) : null;
          return { tripId: g.tripId, tripDate, records: recs };
        });

        // sort groups by tripDate desc (newest first), then tripId
        arr.sort((a, b) => {
          if (a.tripDate === b.tripDate) return Number(b.tripId) - Number(a.tripId);
          if (!a.tripDate) return 1;
          if (!b.tripDate) return -1;
          return a.tripDate < b.tripDate ? 1 : -1;
        });

        if (!mounted) return;
        setGroups(arr);
      } catch (err) {
        console.error("Failed to load pickup records:", err);
        if (mounted) setError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter groups by selected date (match recordedAt within records)
  const visible = useMemo(() => {
    if (!filterDate) return groups;
    return groups
      .map((group) => {
        const recordsOnDate = group.records.filter((record) => toLocalDateString(record?.recordedAt) === filterDate);
        if (!recordsOnDate.length) return null;
        return { ...group, tripDate: filterDate, records: recordsOnDate };
      })
      .filter(Boolean);
  }, [groups, filterDate]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fff" }}>
      <AppBar position="static" sx={{ bgcolor: "#1976d2" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate("/GDChinh")} aria-label="back">
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
              Past Trips ({visible.length})
            </Typography>
            {filterDate && (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Showing trips on {new Date(filterDate).toLocaleDateString()}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <InputBase
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, px: 1, py: 0.5, cursor: "pointer" }}
              inputProps={{ "aria-label": "filter by date" }}
            />
          </Box>
        </Box>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ textAlign: "center", py: 2 }}>
            Error: {error}
          </Typography>
        )}

        {!loading && !error && visible.length === 0 && (
          <Typography variant="body2" sx={{ textAlign: "center", mt: 4, color: "text.secondary" }}>
            No trips / pickup records found for the selected date.
          </Typography>
        )}

        {!loading &&
          !error &&
          visible.map((tripGroup) => (
            <Card key={tripGroup.tripId} sx={{ mb: 2, borderRadius: 2, boxShadow: "0 6px 14px rgba(15,23,36,0.06)" }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                  <Box sx={{ width: "100%" }}>
                    <Typography sx={{ fontWeight: 700 }}>
                      Trip #{tripGroup.tripId} — {tripGroup.tripDate ?? "Unknown date"}
                    </Typography>

                    <Typography sx={{ mt: 1, fontSize: 13, color: "text.secondary" }}>
                      Records: {tripGroup.records.length}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    {/* Records timeline */}
                    <List dense>
                      {tripGroup.records.map((r) => {
                        const time = r.recordedAt ? new Date(r.recordedAt).toLocaleTimeString() : "—";
                        const stopName = r.stop?.name ?? r.stop?.address ?? "Unknown stop";
                        const studentName = r.student?.name ?? "Unknown student";
                        const className = r.student?.className ? ` • ${r.student.className}` : "";
                        const status = r.status ?? "UNKNOWN";
                        return (
                          <ListItem key={r.recordId} sx={{ alignItems: "flex-start" }}>
                            <ListItemText
                              primary={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "space-between" }}>
                                  <Box>
                                    <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{stopName}</Typography>
                                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{studentName}{className}</Typography>
                                  </Box>

                                  <Box sx={{ textAlign: "right" }}>
                                    <Typography sx={{ fontSize: 12 }}>{time}</Typography>
                                    <Chip
                                      label={status}
                                      size="small"
                                      sx={{ mt: 0.5 }}
                                      color={status === "PICKED_UP" ? "primary" : status === "DROPPED_OFF" ? "success" : status === "WAITING" ? "warning" : "default"}
                                    />
                                  </Box>
                                </Box>
                              }
                              secondary={r.stop?.address ?? ""}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
      </Container>
    </Box>
  );
}
