import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Switch,
  Button,
  Stack,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ReportIcon from "@mui/icons-material/Report";
import WarningIcon from "@mui/icons-material/Warning";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AlertIcon from "@mui/icons-material/ReportProblem";
import Map from "../../components/driver/Map";
import SubmitReport from "./SubmitReport";
import SendAlert from "./SendAlert";
import PersonIcon from "@mui/icons-material/Person";

const PickUpMap = ({ onTripComplete }) => {
  // NHẬN CALLBACK
  const tripData = {
    trip_id: 1,
    current_stop_index: 0,
    stops: [
      {
        stop_id: 1,
        name: "Điểm đón Nguyễn Huệ",
        order: 1,
        students: [
          { id: 1, name: "Do Thien Phu", class: "5A", phoneNumber: "0123456789", checked: false },
          { id: 2, name: "Phuong cay", class: "5A", phoneNumber: "0987654321", checked: false },
        ],
      },
      {
        stop_id: 2,
        name: "Điểm đón Lý Tự Trọng",
        order: 2,
        students: [
          { id: 3, name: "Phong Nguyen",  class: "5A",phoneNumber: "0112233445", checked: false },
          { id: 4, name: "Khang Nguyen", class: "4A", phoneNumber: "0223344556", checked: false },
        ],
      },
      {
        stop_id: 3,
        name: "Trường Tiểu học DEF",
        order: 3,
        students: [],
      },
    ],
  };

  const [currentStopIndex, setCurrentStopIndex] = useState(
    tripData.current_stop_index
  );
  const [students, setStudents] = useState(tripData.stops[0].students);
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState("map");
  const [openMissedDialog, setOpenMissedDialog] = useState(false);
  const [missedStudents, setMissedStudents] = useState([]);

  const currentStop = tripData.stops[currentStopIndex];
  const totalStops = tripData.stops.length;
  const isLastStop = currentStopIndex === totalStops - 1;

  useEffect(() => {
    setStudents(
      tripData.stops[currentStopIndex].students.map((s) => ({
        ...s,
        checked: false,
      }))
    );
  }, [currentStopIndex]);

  const toggleStudent = (id) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, checked: !s.checked } : s))
    );
  };

  const handleNextStop = () => {
    const notPicked = students.filter((s) => !s.checked);

    if (notPicked.length > 0) {
      setMissedStudents(notPicked);
      setOpenMissedDialog(true);
      notPicked.forEach((student) => {
        console.log(`[MISSED] ${student.name} tại ${currentStop.name}`);
      });
    } else {
      goToNextStop();
    }
  };

  const goToNextStop = () => {
    setOpenMissedDialog(false);

    if (isLastStop) {
      setView("complete");
    } else {
      setCurrentStopIndex((prev) => prev + 1);
    }
  };

  const menuItems = [
    {
      text: "Gửi báo cáo",
      icon: <ReportIcon color="primary" />,
      action: () => {
        setMenuOpen(false);
        setView("report");
      },
    },
    {
      text: "Gửi cảnh báo",
      icon: <WarningIcon color="error" />,
      action: () => {
        setMenuOpen(false);
        setView("alert");
      },
    },
  ];

  // === MÀN HÌNH PHỤ ===
  if (view === "report") return <SubmitReport onBack={() => setView("map")} />;
  if (view === "alert") return <SendAlert onBack={() => setView("map")} />;

  // === MÀN HÌNH HOÀN THÀNH → QUAY VỀ DASHBOARD ===
  if (view === "complete") {
    return (
      <Box
        sx={{
          width: 414,
          height: 896,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
          bgcolor: "background.default",
        }}
      >
        <CheckCircleIcon sx={{ fontSize: 100, color: "#4caf50", mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Chuyến đi hoàn thành!
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ mb: 3 }}
        >
          {missedStudents.length > 0
            ? `${missedStudents.length} học sinh vắng mặt.`
            : "Tất cả học sinh đã được đón/trả an toàn."}
        </Typography>
        <Button
          variant="contained"
          onClick={onTripComplete}
          sx={{
            borderRadius: "40px",
            py: 1.1,
            px: 4,
            fontWeight: 600,
            background: "linear-gradient(90deg, #4caf50, #66bb6a)",
            width: 300,
            maxWidth: "70%",
            alignSelf: "center",
            boxShadow: "0 6px 16px rgba(76,175,80,0.35)",
            textTransform: "none",
          }}
        >
          Về trang chủ
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: 414,
        height: 896,
        margin: "0 auto",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: 3,
        bgcolor: "grey.100",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* MAP */}
      <Box sx={{ flex: 2, position: "relative" }}>
        <Map currentStop={currentStop} />
        <IconButton
          onClick={() => setMenuOpen(true)}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 1000,
            bgcolor: "white",
            boxShadow: 2,
          }}
        >
          <MenuIcon />
        </IconButton>
        <Box
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            bgcolor: "rgba(255,255,255,0.9)",
            px: 2,
            py: 1,
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Điểm {currentStopIndex + 1}/{totalStops}
          </Typography>
        </Box>
      </Box>

      {/* BOTTOM PANEL */}
      <Box
        sx={{
          flex: 1,
          bgcolor: "white",
          px: 3,
          py: 3,
          boxShadow: "0 -6px 20px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography align="center" sx={{ fontWeight: 600, color: "#2962ff" }}>
          {currentStop.name}
        </Typography>

        {students.length === 0 ? (
          <Typography align="center" color="text.secondary">
            Không có học sinh tại điểm này
          </Typography>
        ) : (
          students.map((s) => (
            <Box
              key={s.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: s.checked ? "#e8f5e9" : "grey.100",
                px: 2,
                py: 1.2,
                borderRadius: 2,
                boxShadow: 1,
                border: s.checked ? "1px solid #4caf50" : "none",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonIcon color={s.checked ? "success" : "action"} />
                <Typography
                  sx={{
                    fontWeight: 500,
                    
                    color: s.checked ? "text.secondary" : "text.primary",
                  }}
                >
                  {s.name} - {s.class} - {s.phoneNumber}
                </Typography>
              </Stack>
              <Switch
                checked={s.checked}
                onChange={() => toggleStudent(s.id)}
                color="success"
              />
            </Box>
          ))
        )}

        <Button
          fullWidth
          variant="contained"
          color={students.some((s) => !s.checked) ? "warning" : "primary"}
          onClick={handleNextStop}
          sx={{
            borderRadius: "50px",
            textTransform: "none",
            py: 1.5,
            fontWeight: 600,
          }}
        >
          {isLastStop
            ? "Hoàn thành chuyến"
            : students.some((s) => !s.checked)
            ? `Đi tiếp (${students.filter((s) => !s.checked).length} vắng)`
            : "Đến điểm dừng tiếp theo"}
        </Button>
      </Box>

      {/* DIALOG CẢNH BÁO MISSED */}
      <Dialog
        open={openMissedDialog}
        onClose={() => setOpenMissedDialog(false)}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AlertIcon color="warning" />
          Học sinh vắng mặt
        </DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{missedStudents.length} học sinh</strong> chưa được đón:
          </Typography>
          <List dense>
            {missedStudents.map((s) => (
              <ListItem key={s.id}>
                <ListItemText primary={s.name} />
              </ListItem>
            ))}
          </List>
          <Typography variant="caption" color="text.secondary">
            Họ sẽ được ghi nhận là <strong>nghỉ học</strong>. Bạn có muốn tiếp
            tục?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMissedDialog(false)}>Hủy</Button>
          <Button onClick={goToNextStop} variant="contained" color="warning">
            Tiếp tục
          </Button>
        </DialogActions>
      </Dialog>

      {/* OVERLAY: click ra ngoài để đóng sidebar */}
      {menuOpen && (
        <Box
          onClick={() => setMenuOpen(false)}
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.25)",
            backdropFilter: "blur(1px)",
            zIndex: 1500, // dưới sidebar (2000) nhưng trên nội dung
          }}
        />
      )}

      {/* SIDEBAR MENU */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: menuOpen ? 0 : "-240px",
          width: "240px",
          height: "100%",
          bgcolor: "white",
          boxShadow: "-3px 0 8px rgba(0,0,0,0.2)",
          transition: "right 0.3s ease",
          zIndex: 2000,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            bgcolor: "grey.50",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#2962ff" }}>
            MENU
          </Typography>
          <IconButton onClick={() => setMenuOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List>
          {menuItems.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton onClick={item.action}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default PickUpMap;
