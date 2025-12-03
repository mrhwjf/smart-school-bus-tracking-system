import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  ListItemButton,
  Icon,
  CircularProgress,
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import MenuIcon from "@mui/icons-material/Menu";
import ErrorIcon from "@mui/icons-material/Error";
import "leaflet/dist/leaflet.css";
import MapIcon from "@mui/icons-material/Map";
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, GeoJSON } from "react-leaflet";
import L from "leaflet";
import { getDirections } from "./api/ors";
import { renderToStaticMarkup } from "react-dom/server";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import { AdminService, SimulationService } from "./api/services";
import socketService from "./api/socket";
import SimulationControl from "./components/SimulationControl";
import { useSimulationSync } from "./hooks/useSimulationSync";
const position = [10.759517, 106.682422];


const busIcon = L.divIcon({
  html: renderToStaticMarkup(<DirectionsBusIcon sx={{ color: "#1976d2" }} />),
  className: "",
  iconSize: [24, 24],
});

export default function GD_Map() {
  const [sideBarOpen, setSidebarOpen] = React.useState(false);
  const [busInfo, setBusInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busLocation, setBusLocation] = useState(null);
  const [routeGeojson, setRouteGeojson] = useState(null);
  const [stops, setStops] = useState([]);
  const [simulationStarted, setSimulationStarted] = useState(false); // Track if simulation already started
  const [simulationData, setSimulationData] = useState(null); // Store data for manual start
  const [simLoading, setSimLoading] = useState(false);
  const { isRunning, activeCount, startSimulation, stopSimulation } = useSimulationSync();
  const date = new Date();
  const navigate = useNavigate();
  
  // TODO: Lấy studentId từ context/auth sau khi login
  const studentId = 1; // Hardcode tạm cho demo

  useEffect(() => {
    let mounted = true;
    
    // Connect WebSocket
    socketService.connect();
    
    // Subscribe to bus location updates for this student's bus
    const unsubLocation = socketService.on('bus:location', (location) => {
      if (!mounted) return;
      
      // Update if this is our student's bus
      if (busInfo && location.bus_id === (busInfo.bus?.busId || busInfo.bus?.bus_id)) {
        console.log('Student bus location update:', location);
        setBusLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          plate_number: location.plate_number || busLocation?.plate_number,
          heading: location.heading,
          speed: location.speed,
        });
      }
    });
    
    // Load thông tin xe và trip data của học sinh - CHỈ CHẠY 1 LẦN
    if (simulationStarted) {
      console.log('Simulation already started, skipping reload');
      return () => {
        mounted = false;
        unsubLocation();
      };
    }
    
    Promise.all([
      AdminService.getStudentBusInfo(studentId),
      AdminService.listTrips()
    ])
      .then(async ([busData, tripData]) => {
        if (!mounted) return;
        
        console.log('Student bus info:', busData);
        setBusInfo(busData);
        
        // Tìm trip của học sinh này dựa trên routeId
        const items = tripData?.items || tripData?.data?.items || (Array.isArray(tripData) ? tripData : []);
        const studentTrip = items.find(trip => {
          const tripRouteId = trip.route?.route_id || trip.route?.routeId || trip.routeId;
          const studentRouteId = busData?.route?.routeId || busData?.route?.route_id;
          return tripRouteId === studentRouteId;
        });
        
        console.log('Student trip found:', studentTrip);
        
        if (studentTrip) {
          // Lấy vị trí xe bus hiện tại
          const busId = studentTrip.bus?.bus_id || studentTrip.bus?.busId;
          if (busId && studentTrip.bus) {
            // Mock location nếu không có realtime data
            const busLoc = {
              latitude: studentTrip.bus.latitude || (10.78 + Math.random() * 0.01),
              longitude: studentTrip.bus.longitude || (106.695 + Math.random() * 0.01),
              plate_number: studentTrip.bus.plate_number || studentTrip.bus.plateNumber
            };
            setBusLocation(busLoc);
            console.log('Bus location:', busLoc);
          }
          
          // Lấy stops từ trip hoặc route
          let tripStops = studentTrip.stops || [];
          if (tripStops.length === 0 && busData?.route?.stops) {
            tripStops = busData.route.stops;
          }
          
          // Normalize stops data
          const normalizedStops = tripStops
            .map(s => ({
              stop_id: s.stop_id || s.stopId,
              name: s.name,
              latitude: parseFloat(s.latitude),
              longitude: parseFloat(s.longitude),
              address: s.address,
              stop_order: s.stop_order || s.seq_index || 0
            }))
            .filter(s => !isNaN(s.latitude) && !isNaN(s.longitude))
            .sort((a, b) => a.stop_order - b.stop_order);
          
          setStops(normalizedStops);
          console.log('Stops loaded:', normalizedStops.length, normalizedStops);
          
          // 🔥 Fetch ORS route - CHỈ 1 LẦN (KHÔNG auto-start)
          if (normalizedStops.length >= 2) {
            const coords = normalizedStops.map(s => [s.longitude, s.latitude]);
            console.log('Fetching ORS route for', coords.length, 'stops');
            
            try {
              const geo = await getDirections(coords, "driving-car", { instructions: false });
              
              if (mounted) {
                console.log('ORS route received:', geo);
                setRouteGeojson(geo);
                
                // Extract ORS coordinates và LƯU để dùng khi nhấn nút
                if (geo?.features?.[0]?.geometry?.coordinates) {
                  const orsCoords = geo.features[0].geometry.coordinates.map(([lng, lat]) => ({
                    latitude: lat,
                    longitude: lng
                  }));
                  
                  console.log(`ORS route ready for student bus ${busId} with ${orsCoords.length} waypoints`);
                  
                  // Lưu data để dùng khi nhấn nút Start
                  setSimulationData({ busId, tripId: studentTrip.trip_id, routeCoords: orsCoords });
                  
                  // Nếu có simulation đang chạy từ tab khác, start lại
                  const storedRunning = localStorage.getItem('simulation_running');
                  if (storedRunning === 'true' && !simulationStarted) {
                    console.log('⚡ Simulation running from another tab, starting student bus...');
                    setTimeout(async () => {
                      try {
                        await SimulationService.stopSimulation(busId);
                        await new Promise(resolve => setTimeout(resolve, 500));
                        await SimulationService.startSimulationWithRoute(busId, orsCoords, 30);
                        console.log(`✓ Started simulation for student bus ${busId}`);
                        setSimulationStarted(true);
                      } catch (err) {
                        console.error('Failed to sync simulation:', err);
                      }
                    }, 1000);
                  }
                }
              }
            } catch (err) {
              console.error('ORS error:', err?.response?.data || err?.message || err);
              // Fallback: vẫn hiển thị polyline thẳng nếu ORS fail
            }
          }
        }
      })
      .catch(err => {
        console.error('Error loading bus info:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
      
    return () => {
      mounted = false;
      unsubLocation();
      // Don't disconnect socket - might be used by other components
    };
  }, [studentId, simulationStarted]); // Chỉ phụ thuộc vào studentId và simulationStarted
  
  // Handler để start simulation khi nhấn nút
  const handleStartSimulation = async () => {
    if (!simulationData) {
      console.warn('Simulation data not ready');
      return;
    }
    
    setSimLoading(true);
    
    try {
      const { busId, tripId, routeCoords } = simulationData;
      console.log(`Starting simulation for student bus ${busId} with ${routeCoords.length} waypoints`);
      
      // Stop old simulation
      try {
        await SimulationService.stopSimulation(busId);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.log('No old simulation to stop');
      }
      
      // Start simulation
      await SimulationService.startSimulationWithRoute(busId, routeCoords, 30);
      console.log(`✓ Started simulation for student bus ${busId}`);
      
      setSimulationStarted(true);
      startSimulation(1); // Update sync state (1 xe)
    } catch (err) {
      console.error('Failed to start simulation:', err);
    } finally {
      setSimLoading(false);
    }
  };
  
  // Handler để stop simulation
  const handleStopSimulation = async () => {
    if (!simulationData) return;
    
    setSimLoading(true);
    
    try {
      const { busId } = simulationData;
      await SimulationService.stopSimulation(busId);
      console.log('🛑 Stopped student bus simulation');
      
      setSimulationStarted(false);
      stopSimulation(); // Update sync state
    } catch (err) {
      console.error('Failed to stop simulation:', err);
    } finally {
      setSimLoading(false);
    }
  };

  const busDriver_info = {
    pickupDate: date.toLocaleDateString("en-GB"),
    licensePlate: busInfo?.bus?.plateNumber || "—",
    driverName: busInfo?.driver?.name || "—",
    driverPhone: busInfo?.driver?.phoneNumber || "—",
    routeName: busInfo?.route?.name || "—",
    stopName: busInfo?.stop?.name || "—",
    startTime: busInfo?.schedule?.startTime || "—",
  };
  function handleMenuItemClick() {
    setSidebarOpen(true);
  }
  function handleLogout() {
    navigate("/login");
  }
  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          position: "relative",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: 3,
        }}>
        <IconButton
          onClick={handleMenuItemClick}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 1300,
            bgcolor: "background.paper",
            boxShadow: 2,
          }}>
          <MenuIcon />
        </IconButton>
        
        {/* Nút điều khiển simulation */}
        <Box
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            zIndex: 1300,
          }}>
          <SimulationControl 
            isRunning={isRunning}
            activeCount={activeCount}
            onStart={handleStartSimulation}
            onStop={handleStopSimulation}
            loading={simLoading}
            size="small"
          />
        </Box>
        
        <MapContainer
          center={busLocation ? [busLocation.latitude, busLocation.longitude] : position}
          zoom={busLocation ? 14 : 15}
          scrollWheelZoom={true}
          zoomControl={false}
          style={{ width: "100%", height: "100%" }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Vẽ đường đi từ ORS hoặc polyline thẳng */}
          {routeGeojson ? (
            <GeoJSON
              key={JSON.stringify(routeGeojson?.features?.[0]?.geometry?.coordinates?.slice(0, 2))}
              data={routeGeojson}
              style={{ color: "#1976d2", weight: 5, opacity: 0.8 }}
            />
          ) : stops.length >= 2 ? (
            <Polyline
              positions={stops.map(s => [s.latitude, s.longitude])}
              pathOptions={{
                color: "#2e7d32",
                weight: 4,
                opacity: 0.7,
                dashArray: "5, 10"
              }}
            />
          ) : null}
          
          {/* Hiển thị các điểm dừng */}
          {stops.map((stop, index) => (
            <CircleMarker
              key={stop.stop_id}
              center={[stop.latitude, stop.longitude]}
              radius={7}
              pathOptions={{
                color: index === 0 ? "#0277bd" : index === stops.length - 1 ? "#d32f2f" : "#2e7d32",
                fillColor: index === 0 ? "#0277bd" : index === stops.length - 1 ? "#d32f2f" : "#2e7d32",
                fillOpacity: 0.9,
                weight: 2
              }}>
              <Popup>
                <div>
                  <strong>{stop.name}</strong>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {index === 0 ? 'Điểm đầu' : index === stops.length - 1 ? 'Điểm cuối' : `Điểm dừng ${index + 1}`}
                  </div>
                  {stop.address && (
                    <div style={{ fontSize: '11px', marginTop: '4px' }}>{stop.address}</div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          ))}
          
          {/* Hiển thị vị trí xe bus */}
          {busLocation && (
            <Marker 
              position={[busLocation.latitude, busLocation.longitude]} 
              icon={busIcon}>
              <Popup>
                <div>
                  <strong>🚌 {busLocation.plate_number}</strong>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    Vị trí hiện tại của xe
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Overlay card: đọc thông số — không phải input */}
        <Paper
          elevation={6}
          sx={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: 18,
            width: "90%",
            borderRadius: 2,
            p: 1,
            bgcolor: "background.paper",
            zIndex: sideBarOpen ? 1100 : 1400,
            pointerEvents: sideBarOpen ? "none" : "auto",
            transition: "z-index 150ms, opacity 150ms",
            opacity: sideBarOpen ? 0.95 : 1,
          }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={1}>
              {/* dòng 1: pick up date + tuyến đường */}
              {/* <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  px: 2.1,
                  py: 0.6,
                  borderRadius: 2,
                  bgcolor: "#fff",
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.03)",
                }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Ngày đón học sinh
                  </Typography>
                  <Typography variant="subtitle1">
                    {busDriver_info.pickupDate} - {busDriver_info.startTime.slice(0, 5)}
                  </Typography>
                </Box>
              </Stack> */}

              {/* Tuyến đường */}
              <Box
                sx={{
                  px: 2,
                  py: 0.7,
                  borderRadius: 2,
                  bgcolor: "#fff",
                  boxShadow: "0 2px 0 rgba(0,0,0,0.04)",
                }}>
                <Typography variant="body2" color="text.secondary">
                  Tuyến đường
                </Typography>
                <Typography variant="subtitle1">
                  {busDriver_info.routeName}
                </Typography>
              </Box>

              {/* Điểm đón */}
              <Box
                sx={{
                  px: 2,
                  py: 0.7,
                  borderRadius: 2,
                  bgcolor: "#fff",
                  boxShadow: "0 2px 0 rgba(0,0,0,0.04)",
                }}>
                <Typography variant="body2" color="text.secondary">
                  Điểm đón
                </Typography>
                <Typography variant="subtitle1">
                  {busDriver_info.stopName}
                </Typography>
              </Box>

              {/* pill đơn: license plate */}
              <Box
                sx={{
                  px: 2,
                  py: 0.7,
                  borderRadius: 2,
                  bgcolor: "#fff",
                  boxShadow: "0 2px 0 rgba(0,0,0,0.04)",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}>
                <Typography variant="body2" color="text.secondary">
                  Biển số xe
                </Typography>
                <Typography variant="subtitle1" sx={{ ml: "auto" }}>
                  {busDriver_info.licensePlate}
                </Typography>
              </Box>

              {/* pill đơn: driver name + phone */}
              <Box
                sx={{
                  px: 2,
                  py: 0.7,
                  borderRadius: 2,
                  bgcolor: "#fff",
                  boxShadow: "0 2px 0 rgba(0,0,0,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tài xế
                  </Typography>
                  <Typography variant="subtitle1">
                    {busDriver_info.driverName}
                  </Typography>
                </Box>
                {busInfo?.driver?.phoneNumber && (
                  <IconButton 
                    color="primary"
                    href={`tel:${busInfo.driver.phoneNumber}`}
                  >
                    <PhoneIcon />
                  </IconButton>
                )}
              </Box>
            </Stack>
          )}
        </Paper>
        <Drawer
          anchor="right"
          open={sideBarOpen}
          onClose={() => setSidebarOpen(false)}
          PaperProps={{
            sx: {
              zIndex: (theme) => theme.zIndex.drawer + 1,
              borderRadius: 2,
              width: 250,
            },
          }}>
          <Box sx={{ p: 2 }}>
            <Typography
              variant="h6"
              sx={{ mb: 1, mt: 1, color: "#1976d2", fontWeight: 700 }}>
              Menu
            </Typography>
          </Box>
          <Divider />
          <List sx={{}}>
            <ListItemButton
              onClick={() => {
                setSidebarOpen(false);
                navigate("/HoSoCuaToi");
              }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PersonIcon />
                <ListItemText primary="Hồ sơ của tôi" sx={{ ml: 1 }} />
              </Box>
            </ListItemButton>
            <ListItemButton
              onClick={() => {
                setSidebarOpen(false);
                navigate("/GDChinh");
              }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PeopleAltIcon />
                <ListItemText primary="Học sinh của tôi" sx={{ ml: 1 }} />
              </Box>
            </ListItemButton>
            <ListItemButton
              sx={{ bgcolor: "#1976d2", color: "#fff" }}
              onClick={() => {
                setSidebarOpen(false);
                navigate("/map");
              }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <MapIcon />
                <ListItemText primary="Xem bản đồ" sx={{ ml: 1 }} />
              </Box>
            </ListItemButton>
            <ListItemButton
              onClick={() => {
                setSidebarOpen(false);
                navigate("/history");
              }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <DirectionsBusIcon />
                <ListItemText primary="Lịch sử tuyến đường" sx={{ ml: 1 }} />
              </Box>
            </ListItemButton>
          </List>
        </Drawer>
      </Box>
    </Box>
  );
}
