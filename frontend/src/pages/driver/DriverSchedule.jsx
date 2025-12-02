import React, { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent, IconButton,  } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TripDetails from "./TripDetails";
import { getSchedulesByDriverId , getRouteById , getAllTrips} from "../../service/userService";


// ================================
// HÀM FORMAT NGÀY
// ================================
const formatDateVN = (date) =>
  date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatDayLabel = (date) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Hôm nay";
  if (date.toDateString() === tomorrow.toDateString()) return "Ngày mai";

  return formatDateVN(date);
};

// ================================
// COMPONENT
// ================================
const DriverWorkSchedule = ({ onBack }) => {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trips, setTrips] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [routesData, setRoutesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Đọc thông tin driver từ localStorage
  const getDriverFromLocalStorage = () => {
    try {
      const authUser = localStorage.getItem('authUser');
      if (!authUser) return null;
      
      const parsed = JSON.parse(authUser);
      if (parsed.role === 'driver' && parsed.user) {
        return parsed.user;
      }
      return null;
    } catch (err) {
      console.error('Error reading localStorage:', err);
      return null;
    }
  };

  const loggedInDriver = getDriverFromLocalStorage();
  const DRIVER_ID = loggedInDriver?.user_id || null;

  // Fetch trips và schedules
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch tất cả trips
      const tripsResult = await getAllTrips();
      if (tripsResult && tripsResult.success && tripsResult.data) {
        setTrips(tripsResult.data.items || []);
        
      }

      // 2. Fetch schedules của driver để lấy thông tin routes
      const schedulesResult = await getSchedulesByDriverId(DRIVER_ID);
      if (schedulesResult && schedulesResult.success && schedulesResult.data) {
        const scheduleItems = schedulesResult.data.items || [];
        setSchedules(scheduleItems);

        // 3. Fetch route details cho mỗi schedule để lấy stops và students
        const routesDataMap = {};
        for (const schedule of scheduleItems) {
          try {
            const routeResult = await getRouteById(schedule.routeId);
            if (routeResult && routeResult.success && routeResult.data) {
              routesDataMap[schedule.routeId] = routeResult.data;
            }
          } catch (err) {
            
          }
        }
        setRoutesData(routesDataMap);
      } else {
        setError("Không thể tải lịch trình");
      }
    } catch (err) {

      setError("Lỗi kết nối. Vui lòng kiểm tra backend.");
    } finally {
      setLoading(false);
    }
  };

  const changeDate = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + days);
    setCurrentDate(newDate);
  };

  // Chuyển đổi trips từ API sang format để hiển thị
  const convertTripsToDisplay = () => {
    // Format ngày hiện tại thành YYYY-MM-DD
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const currentDateStr = `${year}-${month}-${day}`;

    // Lọc trips theo ngày hiện tại và status SCHEDULED
    const tripsForDate = trips.filter(trip => {
      return trip.tripDate === currentDateStr && trip.status === 'SCHEDULED';
    });

    
    return tripsForDate.map(trip => {
      // Tìm schedule tương ứng
      const schedule = schedules.find(s => s.scheduleId === trip.scheduleId);
      if (!schedule) return null;

      // Kiểm tra nếu schedule không thuộc driver hiện tại
      if (schedule.driverId !== DRIVER_ID) return null;

      const routeData = routesData[schedule.routeId];
      const stops = routeData?.stops || [];
      const totalStudents = stops.reduce((sum, stop) => sum + (stop.students?.length || 0), 0);

      return {
        id: trip.tripId,
        tripId: trip.tripId,
        title: `Tuyến ${schedule.routeId}`,
        time: `${schedule.startTime.slice(0, 5)} - ${schedule.endTime.slice(0, 5)}`,
        students: totalStudents,
        stops: stops.length,
        routeData: routeData 
      };
    }).filter(trip => trip !== null); 
  };

  const displayTrips = convertTripsToDisplay();

  // Nếu đã chọn 1 chuyến
  if (selectedTrip)
    return (
      <TripDetails trip={selectedTrip} onBack={() => setSelectedTrip(null)} />
    );

  // Render mỗi trip
  const renderTripCard = (trip) => (
    <Card
      key={trip.id}
      sx={{
        mb: 2,
        mx: 2,
        borderRadius: "12px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        cursor: "pointer",
        transition: "0.2s",
        "&:hover": { transform: "scale(1.01)" },
      }}
      onClick={() => setSelectedTrip(trip)}
    >
      {" "}
      <CardContent>
        <Typography sx={{ fontWeight: 600 }}>{trip.title}</Typography>
        
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <Typography variant="body2">Thời gian: {trip.time}</Typography>
          <Typography variant="body2">Học sinh: {trip.students}</Typography>
        </Box>

        <Typography variant="caption" sx={{ color: "gray" }}>
          {trip.stops} điểm dừng
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
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
          {" "}
          <ArrowBackIcon />{" "}
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600, ml: 1 }}>
          Lịch làm việc{" "}
        </Typography>{" "}
      </Box>

      {/* ĐIỀU HƯỚNG NGÀY */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          px: 2,
        }}
      >
        <IconButton onClick={() => changeDate(-1)}>
          <ChevronLeftIcon />
        </IconButton>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <CalendarTodayIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {formatDayLabel(currentDate)}
          </Typography>
        </Box>

        <IconButton onClick={() => changeDate(1)}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* COUNT */}
      <Typography variant="body2" sx={{ mb: 1, ml: 2 }}>
        Tổng số ca làm việc: {displayTrips.length}
      </Typography>

      {/* DANH SÁCH CHUYẾN */}
      {displayTrips.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 4, color: "gray" }}>
          <Typography>Không có ca làm việc nào</Typography>
        </Box>
      ) : (
        displayTrips.map(renderTripCard)
      )}
    </Box>
  );
};

export default DriverWorkSchedule;
