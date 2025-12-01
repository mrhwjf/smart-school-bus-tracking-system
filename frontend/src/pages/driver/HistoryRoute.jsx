import React, { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent, IconButton, CircularProgress } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TripDetails from "./TripDetails";
import { getAllTrips ,getRouteById , getSchedulesByDriverId } from "../../service/userService";


const HistoryRoute = ({ onBack }) => {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [completedTrips, setCompletedTrips] = useState([]);
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

  useEffect(() => {
    fetchCompletedTrips();
  }, []);

  const fetchCompletedTrips = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch schedules của driver để lấy danh sách trips và routeId
      const schedulesResult = await getSchedulesByDriverId(DRIVER_ID);
      if (!schedulesResult || !schedulesResult.success || !schedulesResult.data) {
        setError("Không thể tải lịch trình");
        return;
      }

      const schedules = schedulesResult.data.items || [];
      // Map scheduleId -> schedule để lấy routeId và thời gian sau này
      const scheduleMap = {};
      schedules.forEach(s => {
        scheduleMap[s.scheduleId] = s;
      });

      // 2. Fetch tất cả trips
      const tripsResult = await getAllTrips();
      if (tripsResult && tripsResult.success && tripsResult.data) {
        const allTrips = tripsResult.data.items || [];

        const routesDataMap = {};
        const driverCompletedTrips = [];

        for (const trip of allTrips) {
          // Chỉ lấy trips có status COMPLETED và scheduleId thuộc driver
          if (trip.status !== 'COMPLETED') continue;
          
          const schedule = scheduleMap[trip.scheduleId];
          if (!schedule) continue; // Không phải schedule của driver này

          try {
            // Lấy routeId từ schedule, không phải từ trip
            const routeId = schedule.routeId;
            
            // Fetch route data
            if (!routesDataMap[routeId]) {
              const routeResult = await getRouteById(routeId);
              if (routeResult && routeResult.success && routeResult.data) {
                routesDataMap[routeId] = routeResult.data;
              }
            }

            // Gắn routeId và schedule vào trip để dùng sau này
            trip.routeId = routeId;
            trip.schedule = schedule;
            driverCompletedTrips.push(trip);
          } catch (err) {
            console.warn(`⚠️ Could not fetch data for trip ${trip.tripId}:`, err);
          }
        }

        // Sắp xếp theo thời gian mới nhất trước
        driverCompletedTrips.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

        setCompletedTrips(driverCompletedTrips);
        setRoutesData(routesDataMap);
      } else {
        setError("Không thể tải lịch sử");
      }
    } catch (err) {
      setError("Lỗi kết nối. Vui lòng kiểm tra backend.");
    } finally {
      setLoading(false);
    }
  };

  // Convert trip data to display format
  const formatTripForDisplay = (trip) => {
    const routeData = routesData[trip.routeId];
    const stops = routeData?.stops || [];
    const totalStudents = stops.reduce((sum, stop) => sum + (stop.students?.length || 0), 0);

    // Lấy thời gian từ schedule
    const schedule = trip.schedule;
    const timeStr = schedule 
      ? `${schedule.startTime.slice(0, 5)} - ${schedule.endTime.slice(0, 5)}`
      : 'N/A';

    // Format date từ startTime của trip
    let dateStr = 'N/A';
    const dateSource = trip.startTime || trip.tripDate;
    
    if (dateSource) {
      const startTime = new Date(dateSource);
      if (!isNaN(startTime.getTime())) {
        dateStr = startTime.toLocaleDateString('vi-VN', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        });
      }
    }

    return {
      id: trip.tripId,
      tripId: trip.tripId,
      title: dateStr,
      route: routeData?.name || `Tuyến ${trip.routeId}`,
      time: timeStr,
      routeData: routeData
    };
  };

  if (selectedTrip)
    return (
      <TripDetails trip={selectedTrip} onBack={() => setSelectedTrip(null)} />
    );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const displayTrips = completedTrips.map(formatTripForDisplay);

  const renderTripCard = (trip) => (
    <Card
      key={trip.id}
      sx={{
        mb: 2,
        borderRadius: "10px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        mx: 2,
        cursor: "pointer",
        transition: "0.2s",
        "&:hover": { transform: "scale(1.01)" },
      }}
      onClick={() => setSelectedTrip(trip)}
    >
      {" "}
      <CardContent>
        {/* Title */}
        <Box>
          <Typography sx={{ fontWeight: 600 }}>{trip.title}</Typography>
        </Box>

        {/* Labels */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 1,
            color: "#6f5c6c",
            fontSize: "0.85rem",
          }}
        >
          <span>Tuyến</span>
        </Box>

        {/* Values */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
          <span>{trip.route}</span>

        </Box>

        {/* Time */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <Typography variant="body2">{trip.time}</Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
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
          Lịch sử tuyến
        </Typography>
      </Box>

      <Typography variant="body2" sx={{ mb: 1, ml: 2 }}>
        Chuyến đã đi ({displayTrips.length})
      </Typography>

      {displayTrips.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 4, color: "gray" }}>
          <Typography>Chưa có chuyến nào hoàn thành</Typography>
        </Box>
      ) : (
        displayTrips.map(renderTripCard)
      )}
    </Box>
  );
};

export default HistoryRoute;
