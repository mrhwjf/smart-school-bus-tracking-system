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
import { getAllPickupRecords } from "./services/pickupRecordService";
import { getStudentsByParent } from "./services/studentService";

/**
 * RouteHistory
 * - Only shows pickup records for students of the logged-in parent.
 * - Uses getStudentsByParent(parentId, token) to build allowed studentId set,
 *   then filters pickup records accordingly.
 */

export default function RouteHistory() {
  const navigate = useNavigate();
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState([]); // [{ tripId, tripDate, records: [...] }]

  // get auth info from localStorage (same pattern used in other screens)
  const authUserRaw = localStorage.getItem("authUser");
  const authUser = authUserRaw ? JSON.parse(authUserRaw) : null;
  const parentId =
    authUser?.user?.user_id ??
    authUser?.user?.id ??
    authUser?.id ??
    authUser?.userId ??
    null;
  const token = authUser?.token ?? authUser?.accessToken ?? null;

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!parentId) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1) load children of this parent
        const students = (await getStudentsByParent(parentId, token)) || [];
        // normalize possible id fields into strings and into a Set for fast lookup
        const allowedIds = new Set(
          students.map((s) =>
            String(s.studentId ?? s.id ?? s._id ?? s.student_id ?? "")
          )
        );

        // 2) load all pickup records (service may accept token)
        const res = await getAllPickupRecords(token);
        const items = res?.data?.items ?? res?.items ?? res ?? [];

        // 3) filter records to only those whose student is in allowedIds
        const filtered = (items || []).filter((rec) => {
          // possible places where student id might live
          const sid =
            rec?.student?.studentId ??
            rec?.student?.id ??
            rec?.student?._id ??
            rec?.student?.student_id ??
            rec?.studentId ??
            rec?.student_id ??
            rec?.studentIdFromPayload ??
            null;
          if (sid == null) return false;
          return allowedIds.has(String(sid));
        });

        // 4) group filtered records by tripId
        const map = new Map();
        filtered.forEach((rec) => {
          const tripId = rec?.trip?.tripId ?? rec?.tripId ?? "unknown";
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
          const first = recs[0];
          const tripDate = first?.recordedAt
            ? first.recordedAt.slice(0, 10)
            : null;
          return { tripId: g.tripId, tripDate, records: recs };
        });

        // sort groups by tripDate desc (newest first), then tripId
        arr.sort((a, b) => {
          if (a.tripDate === b.tripDate)
            return Number(b.tripId) - Number(a.tripId);
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
  }, [parentId, token, navigate]);

  // Filter groups by selected date (match tripDate)
  const visible = useMemo(() => {
    if (!filterDate) return groups;
    return groups.filter((g) => g.tripDate === filterDate);
  }, [groups, filterDate]);

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
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                px: 1,
                py: 0.5,
                cursor: "pointer",
              }}
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
          <Typography
            variant="body2"
            sx={{ textAlign: "center", mt: 4, color: "text.secondary" }}>
            No trips / pickup records found for your children
            {filterDate ? ` on ${filterDate}` : ""}.
          </Typography>
        )}

        {!loading &&
          !error &&
          visible.map((tripGroup) => (
            <Card
              key={tripGroup.tripId}
              sx={{
                mb: 2,
                borderRadius: 2,
                boxShadow: "0 6px 14px rgba(15,23,36,0.06)",
              }}>
              <CardContent sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 2,
                  }}>
                  <Box sx={{ width: "100%" }}>
                    <Typography sx={{ fontWeight: 700 }}>
                      Trip #{tripGroup.tripId} —{" "}
                      {tripGroup.tripDate ?? "Unknown date"}
                    </Typography>

                    <Typography
                      sx={{ mt: 1, fontSize: 13, color: "text.secondary" }}>
                      Records: {tripGroup.records.length}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    {/* Records timeline */}
                    <List dense>
                      {tripGroup.records.map((r) => {
                        const time = r.recordedAt
                          ? new Date(r.recordedAt).toLocaleTimeString()
                          : "—";
                        const stopName =
                          r.stop?.name ?? r.stop?.address ?? "Unknown stop";
                        const studentName =
                          r.student?.name ?? r.studentName ?? "Unknown student";
                        const className = r.student?.className
                          ? ` • ${r.student.className}`
                          : "";
                        const status = r.status ?? "UNKNOWN";
                        return (
                          <ListItem
                            key={
                              r.recordId ??
                              `${tripGroup.tripId}-${time}-${studentName}`
                            }
                            sx={{ alignItems: "flex-start" }}>
                            <ListItemText
                              primary={
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    justifyContent: "space-between",
                                  }}>
                                  <Box>
                                    <Typography
                                      sx={{ fontWeight: 700, fontSize: 14 }}>
                                      {stopName}
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontSize: 13,
                                        color: "text.secondary",
                                      }}>
                                      {studentName}
                                      {className}
                                    </Typography>
                                  </Box>

                                  <Box sx={{ textAlign: "right" }}>
                                    <Typography sx={{ fontSize: 12 }}>
                                      {time}
                                    </Typography>
                                    <Chip
                                      label={status}
                                      size="small"
                                      sx={{ mt: 0.5 }}
                                      color={
                                        status === "PICKED_UP"
                                          ? "primary"
                                          : status === "DROPPED_OFF"
                                          ? "success"
                                          : status === "WAITING"
                                          ? "warning"
                                          : "default"
                                      }
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
