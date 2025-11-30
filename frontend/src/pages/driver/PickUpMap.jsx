import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Switch,
  Button,
  Stack,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from "@mui/material";

// Components và Icons
import MenuIcon from "@mui/icons-material/Menu";
import ReportIcon from "@mui/icons-material/Report";
import WarningIcon from "@mui/icons-material/Warning";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AlertIcon from "@mui/icons-material/ReportProblem";
import PersonIcon from "@mui/icons-material/Person";

// Nhập các component của Leaflet (ĐÃ THÊM useMap)
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Components phụ (giả lập)
import SubmitReport from "./SubmitReport";
import SendAlert from "./SendAlert";

// API Services
import { getAssignedTripForDriver } from "../../service/tripService";
import { getScheduleById } from "../../service/scheduleService";
import { createPickupRecord} from "../../service/pickupRecordService";
import { getAllStudents } from "../../service/studentService";

// ***************************************
// 🔑 THÔNG TIN MAP/TILE (Leaflet/OSM)
// ***************************************
const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// ***************************************
// 🔑 THÔNG TIN OPENROUTESERVICE API KEY (CẦN THAY THẾ)
// ***************************************
const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijk2NmVhZTVhZjhjOTQ3M2Y4YzA3MTZmNDA5ZTAwYTU4IiwiaCI6Im11cm11cjY0In0="; // <-- PHẢI THAY THẾ BẰNG KEY ORS CỦA BẠN!

// ⚙️ Fix lỗi icon Leaflet và cấu hình mặc định
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ⭐ Tọa độ trung tâm mặc định (HCM)
const DEFAULT_CENTER = [10.77, 106.7];

// 🛠️ COMPONENT MỚI: Bắt buộc Leaflet tính toán lại kích thước
const MapResizeHandler = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
};

// ❌ LOẠI BỎ HÀM GIẢI MÃ FLEXIBLE POLYLINE CỦA HERE
// (ORS trả về GeoJSON, không cần hàm này nữa)

const PickUpMap = ({ onTripComplete }) => {
  // TODO: Lấy DRIVER_ID từ context/session
  const DRIVER_ID = 2;
  
  // State cho trip data từ API
  const [tripData, setTripData] = useState(null);
  const [loadingTrip, setLoadingTrip] = useState(true);
  const [tripError, setTripError] = useState(null);
  
  // State cho UI
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [students, setStudents] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState("map");
  const [openMissedDialog, setOpenMissedDialog] = useState(false);
  const [missedStudents, setMissedStudents] = useState([]);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

  // Fetch trip được phân công cho driver
  useEffect(() => {
    const fetchAssignedTrip = async () => {
      try {
        setLoadingTrip(true);
        setTripError(null);

        // 1. Lấy trip được phân công hôm nay
        const trip = await getAssignedTripForDriver(DRIVER_ID);
        
        if (!trip) {
          setTripError("Không có chuyến đi nào được phân công hôm nay");
          return;
        }

        // 2. Lấy schedule để biết routeId và route details
        const scheduleResult = await getScheduleById(trip.scheduleId);
        
        if (!scheduleResult || !scheduleResult.success || !scheduleResult.data) {
          setTripError("Không thể tải thông tin lịch trình");
          return;
        }

        const schedule = scheduleResult.data;
        const route = schedule.route;

        if (!route || !route.stops || route.stops.length === 0) {
          setTripError("Không có điểm dừng nào trong tuyến này");
          return;
        }

        // 3. Fetch all students để lấy thông tin đầy đủ
        const studentsResult = await getAllStudents();
        const studentsMap = {};
        
        if (studentsResult && studentsResult.success && studentsResult.data?.items) {
          studentsResult.data.items.forEach(student => {
            studentsMap[student.studentId] = student;
          });
        }

        // 4. Transform stops data với student info đầy đủ
        const stops = route.stops
          .sort((a, b) => (a.seqIndex || 0) - (b.seqIndex || 0))
          .map(stop => ({
            stop_id: stop.stopId,
            name: stop.name,
            order: stop.seqIndex || 0,
            lat: stop.latitude,
            lng: stop.longitude,
            students: (stop.students || []).map(s => {
              const studentData = studentsMap[s.studentId];
              return {
                id: s.studentId,
                name: studentData?.name || 'N/A',
                class: studentData?.class?.name || s.className || 'N/A',
                phoneNumber: studentData?.parent?.phoneNumber || 'N/A',
                checked: false,
              };
            }),
          }));

        // 5. Set trip data
        const transformedTrip = {
          trip_id: trip.tripId,
          current_stop_index: 0,
          stops: stops,
        };

        setTripData(transformedTrip);
      } catch (err) {
        console.error("Error fetching assigned trip:", err);
        setTripError("Lỗi kết nối API. Vui lòng kiểm tra backend.");
      } finally {
        setLoadingTrip(false);
      }
    };

    fetchAssignedTrip();
  }, []);
  
  // Fetch route coordinates từ OpenRouteService
  useEffect(() => {
    if (!tripData || !tripData.stops || tripData.stops.length < 2) {
      setRouteCoordinates([]);
      return;
    }

    // Lấy danh sách tọa độ dừng theo định dạng ORS: [lng, lat]
    const coords = tripData.stops.map((stop) => [stop.lng, stop.lat]); 

    if (coords.length < 2) {
        setRouteCoordinates([]);
        return;
    }

    // ORS API call (sử dụng POST vì có nhiều điểm dừng)
    const url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";
    
    // Tạo body theo chuẩn ORS (coordinates: [[lng1, lat1], [lng2, lat2], ...])
    const requestBody = {
        coordinates: coords,
        
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png',
            'Content-Type': 'application/json',
            // ORS sử dụng Authorization header (API Key)
            'Authorization': ORS_API_KEY, 
        },
        body: JSON.stringify(requestBody)
    })
      .then((res) => {
        if (!res.ok) {
            // Bao gồm thông báo lỗi nếu có
            return res.json().then(errorData => {
                throw new Error(`HTTP error! status: ${res.status}. Message: ${errorData.error ? errorData.error.message : res.statusText}`);
            });
        }
        return res.json();
      })
      .then((data) => {
        // Trích xuất tọa độ từ GeoJSON (ORS response)
        const features = data.features;
        if (features && features.length > 0 && features[0].geometry) {
          const rawCoords = features[0].geometry.coordinates; // [[lng, lat], [lng, lat], ...]
          
          // Chuyển đổi từ [lng, lat] (ORS GeoJSON) sang [lat, lng] (Leaflet Polyline)
          const leafletCoords = rawCoords.map(c => [c[1], c[0]]); 
          
          setRouteCoordinates(leafletCoords);
        } else {
             console.error('ORS API không trả về tuyến đường hợp lệ:', data);
             setRouteCoordinates([]);
        }
      })
      .catch((err) => {
        console.error('OpenRouteService API error:', err.message);
        setRouteCoordinates([]);
      });
  }, [tripData]); // Dependency array: gọi lại khi tripData thay đổi

  // Cập nhật danh sách học sinh và tâm bản đồ khi điểm dừng thay đổi
  useEffect(() => {
    if (!tripData || !tripData.stops[currentStopIndex]) return;
    
    const newStudents = tripData.stops[currentStopIndex].students.map((s) => ({
      ...s,
      checked: false,
    }));
    setStudents(newStudents);

    // Cập nhật tâm bản đồ đến điểm dừng hiện tại
    const currentStop = tripData.stops[currentStopIndex];
    if (currentStop.lat && currentStop.lng) {
      setMapCenter([currentStop.lat, currentStop.lng]);
    }
  }, [currentStopIndex, tripData]);

  // Hiển thị loading khi đang fetch data
  if (loadingTrip) {
    return (
      <Box
        sx={{
          width: 414,
          height: 896,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Hiển thị lỗi nếu có
  if (tripError || !tripData) {
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
        }}
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          {tripError || "Không thể tải dữ liệu chuyến đi"}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Thử lại
        </Button>
      </Box>
    );
  }

  const currentStop = tripData.stops[currentStopIndex];
  const totalStops = tripData.stops.length;
  const isLastStop = currentStopIndex === totalStops - 1;

  const toggleStudent = async (id) => {
    const student = students.find(s => s.id === id);
    const newCheckedState = !student.checked;
    
    // Cập nhật UI ngay lập tức
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, checked: newCheckedState } : s))
    );

    // Gọi API để tạo hoặc cập nhật pickup record
    try {
      if (newCheckedState) {
        // Check → Tạo PICKED_UP record
        await createPickupRecord({
          studentId: id,
          stopId: currentStop.stop_id,
          tripId: tripData.trip_id,
          status: "PICKED_UP",
          recordedAt: new Date().toISOString(),
        });
      }
      // Note: Nếu uncheck, có thể cần API để xóa hoặc update về WAITING
    } catch (error) {
      console.error("Error updating pickup record:", error);
      // Rollback UI nếu API fail
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, checked: !newCheckedState } : s))
      );
    }
  };

  const handleNextStop = async () => {
    const notPicked = students.filter((s) => !s.checked);

    if (notPicked.length > 0) {
      setMissedStudents(notPicked);
      setOpenMissedDialog(true);
      
      // Tạo MISSED records cho học sinh vắng
      try {
        await Promise.all(
          notPicked.map(student =>
            createPickupRecord({
              studentId: student.id,
              stopId: currentStop.stop_id,
              tripId: tripData.trip_id,
              status: "MISSED",
              recordedAt: new Date().toISOString(),
            })
          )
        );
      } catch (error) {
        console.error("Error creating MISSED records:", error);
      }
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
  if (view === "report") return <SubmitReport onBack={() => setView("map")} tripId={tripData.trip_id} />;
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
      <Box sx={{ flex: 2, position: "relative", minHeight: "350px" }}>
        {/* MAP CONTAINER (Leaflet + OSM) */}
        <MapContainer
          key={currentStopIndex} // Key giúp MapContainer reset và re-center
          center={mapCenter}
          zoom={15}
          style={{ width: "100%", height: "100%", zIndex: 0 }}
          // Bỏ thuộc tính scrollWheelZoom để bật zoom
        >
          {/* Nền bản đồ OSM */}
          <TileLayer
            attribution={OSM_ATTRIBUTION}
            url={OSM_TILE_URL}
          />

          {/* 🛠️ Khắc phục lỗi hiển thị nền xám */}
          <MapResizeHandler />
          
          {/* Vẽ Polyline cho tuyến đường bằng dữ liệu từ ORS */}
          {routeCoordinates.length > 1 && (
            <Polyline pathOptions={{ color: '#00bcd4', weight: 4 }} positions={routeCoordinates} />
          )}
          
          {/* Marker cho TẤT CẢ điểm dừng */}
          {tripData.stops.map((stop, idx) => (
            stop.lat && stop.lng ? (
              <Marker key={stop.stop_id ?? idx} position={[stop.lat, stop.lng]}>
                <Popup>
                  <strong>{stop.name}</strong>
                  <br />
                  {idx === currentStopIndex ? "Điểm hiện tại" : `Thứ tự: ${stop.order}`}
                </Popup>
              </Marker>
            ) : null
          ))}
        </MapContainer>
        {/* HẾT MAP CONTAINER */}

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
          minHeight: "50%",
          overflowY: "auto", // Cho phép cuộn nếu danh sách dài
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
            zIndex: 1500,
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