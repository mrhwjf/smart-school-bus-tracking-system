import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Switch,
  Button,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import { getAssignedTripForDriver } from "../../service/tripService";
import { getScheduleById } from "../../service/scheduleService";
import { getAllStudents } from "../../service/studentService";
import { getPickupRecords, updatePickupRecord } from "../../service/pickupRecordService";

const DRIVER_ID = 2;

const SubmitReport = ({ onBack }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTripStudents();
  }, []);

  const fetchTripStudents = async () => {
    try {
      setFetchLoading(true);
      
      const trip = await getAssignedTripForDriver(DRIVER_ID);
      if (!trip) {
        setError("Không tìm thấy chuyến đi hôm nay");
        setFetchLoading(false);
        return;
      }

      const scheduleResult = await getScheduleById(trip.scheduleId);
      const route = scheduleResult.data.route;

      const studentsResult = await getAllStudents();
      const studentsMap = {};
      if (studentsResult?.success && studentsResult.data?.items) {
        studentsResult.data.items.forEach(student => {
          studentsMap[student.studentId] = student;
        });
      }

      // Fetch pickup_records to get current status
      const pickupRecordsResult = await getPickupRecords({ tripId: trip.tripId, size: 200 });
      const pickupRecordsMap = {};
      if (pickupRecordsResult.success && pickupRecordsResult.data?.items) {
        pickupRecordsResult.data.items.forEach(record => {
          pickupRecordsMap[record.studentId] = record;
        });
      }

      const studentsList = [];
      route.stops.forEach(stop => {
        (stop.students || []).forEach(s => {
          const studentData = studentsMap[s.studentId];
          const pickupRecord = pickupRecordsMap[s.studentId];
          
          if (studentData && pickupRecord) {
            studentsList.push({
              id: s.studentId,
              recordId: pickupRecord.recordId,
              name: studentData.name || 'N/A',
              class: studentData.class?.name || 'N/A',
              phoneNumber: studentData.parent?.phoneNumber || 'N/A',
              checked: pickupRecord.status === 'PICKED_UP', // Show as checked if PICKED_UP
              status: pickupRecord.status, // Store actual status from DB
            });
          }
        });
      });

      setStudents(studentsList);
    } catch (err) {
      console.error("Error fetching trip students:", err);
      setError(err.message || "Lỗi khi tải danh sách học sinh");
    } finally {
      setFetchLoading(false);
    }
  };

  // 🔹 Toggle student checked state
  const handleToggle = useCallback((id) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, checked: !s.checked } : s))
    );
  }, []);

  // 🔹 Submit handler with API calls
  const handleSubmit = useCallback(async () => {
    const selected = students.filter((s) => s.checked);
    if (!selected.length) return alert("Vui lòng chọn ít nhất 1 học sinh!");

    setLoading(true);
    setError("");

    try {
      // Update pickup_records based on checkbox state:
      // - checked (PICKED_UP) → DROPPED_OFF
      // - unchecked (WAITING/MISSED) → MISSED
      const updatePromises = students.map(student => {
        let newStatus;
        
        if (student.checked) {
          // If checked, means PICKED_UP → change to DROPPED_OFF
          newStatus = 'DROPPED_OFF';
        } else {
          // If unchecked, means not picked up → MISSED
          newStatus = 'MISSED';
        }

        return updatePickupRecord(student.recordId, {
          status: newStatus,
          recordedAt: new Date().toISOString(),
        });
      });

      await Promise.all(updatePromises);

      console.log("Báo cáo đã gửi:", selected.map((s) => s.name));
      setOpenSuccess(true);

      setTimeout(() => {
        setOpenSuccess(false);
        onBack();
      }, 1500);
    } catch (err) {
      console.error("Error submitting report:", err);
      setError(err.message || "Gửi báo cáo thất bại");
    } finally {
      setLoading(false);
    }
  }, [students, onBack]);

  // 🔹 Render student list
  const studentList = useMemo(
    () =>
      students.map((student) => (
        <Paper
          key={student.id}
          elevation={1}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 1.5,
            mb: 1.5,
            borderRadius: 9999,
            bgcolor: student.checked ? "#e8f5e9" : "#f9f9f9",
            border: student.checked ? "1px solid #4caf50" : "none",
            transition: "all 0.2s",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <PersonIcon color={student.checked ? "success" : "action"} />
            <Typography
              fontWeight={500}
              sx={{
                
                color: student.checked ? "text.secondary" : "text.primary",
              }}
            >
              {student.name} {student.class ? `- ${student.class}` : ""} {student.phoneNumber ? `- ${student.phoneNumber}` : ""}
            </Typography>
          </Stack>
          <Switch
            checked={student.checked}
            onChange={() => handleToggle(student.id)}
            color="success"
          />
        </Paper>
      )),
    [students, handleToggle]
  );

  return (
    <>
      <Box
        sx={{
          width: 414,
          height: 896,
          margin: "0 auto",
          boxShadow: 3,
          overflow: "hidden",
          bgcolor: "white",
        }}
      >
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
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600, ml: 1 }}>
            Gửi báo cáo
          </Typography>
        </Box>

        {/* STUDENT LIST */}
        <Box sx={{ p: 2, flex: 1, overflowY: "auto" }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {fetchLoading ? (
            <Typography textAlign="center" color="text.secondary" py={4}>
              Đang tải danh sách học sinh...
            </Typography>
          ) : students.length === 0 ? (
            <Typography textAlign="center" color="text.secondary" py={4}>
              Không có học sinh nào trong chuyến đi này
            </Typography>
          ) : (
            <>
              
              {studentList}
            </>
          )}

          {/* SUBMIT BUTTON */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={loading || fetchLoading}
            sx={{
              borderRadius: "9999px",
              textTransform: "none",
              py: 1.6,
              mt: 4,
              fontWeight: 600,
              background: loading
                ? "#ccc"
                : "linear-gradient(90deg, rgba(0,199,255,1) 0%, rgba(0,255,214,1) 100%)",
              boxShadow: "0 4px 12px rgba(0,199,255,0.3)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(0,199,255,0.4)",
              },
            }}
          >
            {loading ? "Đang gửi..." : "Gửi báo cáo học sinh"}
          </Button>
        </Box>
      </Box>

      {/* SUCCESS DIALOG */}
      <Dialog
        open={openSuccess}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
            textAlign: "center",
            boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
            minWidth: 280,
          },
        }}
      >
        <CheckCircleIcon sx={{ fontSize: 60, color: "#4caf50", mb: 1 }} />
        <DialogTitle sx={{ p: 0, fontSize: "1.1rem", fontWeight: 600 }}>
          Đã gửi thành công!
        </DialogTitle>
        <DialogContent sx={{ p: 0, color: "text.secondary", fontSize: "0.9rem" }}>
          Báo cáo đã được lưu.
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubmitReport;