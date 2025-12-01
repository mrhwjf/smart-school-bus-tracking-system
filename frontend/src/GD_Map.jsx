import React from "react";
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
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import MenuIcon from "@mui/icons-material/Menu";
import ErrorIcon from "@mui/icons-material/Error";
import "leaflet/dist/leaflet.css";
import MapIcon from "@mui/icons-material/Map";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
const position = [10.759517, 106.682422];
const customIcon = new L.Icon({
  iconUrl: new URL("./maker-current-position.png", import.meta.url).href,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});
export default function GD_Map() {
  const [sideBarOpen, setSidebarOpen] = React.useState(false);
  const date = new Date();
  const navigate = useNavigate();
  const busDriver_info = {
    pickupDate: date.toLocaleDateString("en-GB"),
    licensePlate: "51B-123.45",
    driverName: "Đỗ Thiên Phú",
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
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={true}
          zoomControl={false}
          style={{ width: "100%", height: "100%" }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={customIcon}>
            <Popup>
              <strong>Đại học Sài Gòn</strong>
            </Popup>
          </Marker>
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
          <Stack spacing={1}>
            {/* dòng 1: pick up date + phone icon */}
            <Stack
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
                  {busDriver_info.pickupDate} - {date.getHours()}:
                  {date.getMinutes().toString().padStart(2, "0")}
                </Typography>
              </Box>
            </Stack>

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

            {/* pill đơn: driver name */}
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
                Tên tài xế
              </Typography>
              <Typography variant="subtitle1" sx={{ ml: "auto" }}>
                {busDriver_info.driverName}
              </Typography>
            </Box>
          </Stack>
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
