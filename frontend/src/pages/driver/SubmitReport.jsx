import React, { useState, useCallback, useMemo } from "react";
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";

// 🔹 Dữ liệu tĩnh ra ngoài
const INITIAL_STUDENTS = [
  { id: 1, name: "Do Thien Phu", class: "5A", phoneNumber: "0123456789", checked: true },
  { id: 2, name: "Phuong Cay", class: "5A", phoneNumber: "0987654321", checked: false },
  { id: 3, name: "Phong Nguyen", class: "5A", phoneNumber: "0112233445", checked: false },
  { id: 4, name: "Khang Nguyen", class: "4A", phoneNumber: "0223344556", checked: true },
];

const SubmitReport = ({ onBack }) => {
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [loading, setLoading] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);

  // 🔹 Toggle student checked state
  const handleToggle = useCallback((id) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, checked: !s.checked } : s))
    );
  }, []);

  // 🔹 Submit handler
  const handleSubmit = useCallback(() => {
    const selected = students.filter((s) => s.checked);
    if (!selected.length) return alert("Vui lòng chọn ít nhất 1 học sinh!");

    setLoading(true);
    setTimeout(() => {
      console.log("Báo cáo đã gửi:", selected.map((s) => s.name));
      setLoading(false);
      setOpenSuccess(true);

      setTimeout(() => {
        setOpenSuccess(false);
        onBack();
      }, 1500);
    }, 1200);
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
          {studentList}

          {/* SUBMIT BUTTON */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={loading}
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
