import React, { useEffect } from "react";
import { getAllUsers } from "./services/userService";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Typography,
  Container,
  CssBaseline,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
} from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import MenuIcon from "@mui/icons-material/Menu";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import MapIcon from "@mui/icons-material/Map";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import PersonIcon from "@mui/icons-material/Person";
import ClassIcon from "@mui/icons-material/Class";
import WcIcon from "@mui/icons-material/Wc";
import CakeIcon from "@mui/icons-material/Cake";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import EmailIcon from "@mui/icons-material/Email";
import { useNavigate } from "react-router-dom";
import { blue } from "@mui/material/colors";
import Diversity1Icon from "@mui/icons-material/Diversity1";
// import { get } from "../../backend/src/routes";
// import { success } from "../../backend/src/utils/apiResponse";

export default function GDHoSoCuaToi() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null); // dropdown anchor
  const [user, setUser] = React.useState(null); // current user profile
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const navigate = useNavigate();

  const handleMenuItemClick = () => setSidebarOpen(true);
  const handleLogout = () => console.log("Đăng xuất");

  // Demo: danh sách 2 học sinh
  // const user_example_data = {
  //   id: "3123410268",
  //   name: "Đỗ Thiên Phú",
  //   phone: "0896027930",
  //   email: "youremail@sucksyourass.com",
  //   relationship: "Dượng",
  // };
  // const user_example_data_2 = {
  
  useEffect(() => {
    getAllUsers().then((res) => {
      if (res.success && res.data.items) {
        const found = res.data.items.find((u) => u.userId === 4);
        setUser(found || null);
      }
    });
  }, []);

  // dropdown handlers
  const handleOpenDropdown = (e) => setAnchorEl(e.currentTarget);
  const handleCloseDropdown = () => setAnchorEl(null);
  const handleSelectStudent = (id) => {
    setCurrentId(id);
    handleCloseDropdown();
  };

  // safe initials for avatar
  const initials =
    user && user.name
      ? user.name
          .split(" ")
          .map((n) => (n ? n[0] : ""))
          .filter(Boolean)
          .slice(0, 2)
          .join("")
      : "";

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}>
        <Box
          sx={{
            mt: 1.5,
            height: "100%",
            width: "92.5%",
            maxWidth: 500,
            borderRadius: 2,
            bgcolor: "background.paper",
            overflow: "visible",
            boxShadow: 2,
          }}>
          {/* Header */}
          <AppBar position="static" color="transparent" elevation={0}>
            <Toolbar
              sx={{
                justifyContent: "space-between",
                py: 1,
                bgcolor: "#1976d2",
              }}>
              <Typography
                variant="h5"
                fontWeight={600}
                sx={{
                  p: 2,
                  color: "#FFFFFF",
                  width: "100%",
                  textAlign: "center",
                }}>
                Hồ sơ của tôi
              </Typography>

              {/* menu icon ở phải */}
              <IconButton
                onClick={handleMenuItemClick}
                edge="start"
                aria-label="menu"
                sx={{
                  width: 40,
                  height: 40,
                  color: "#FFFFFF",
                  bgcolor: "transparent",
                  "&:hover": { bgcolor: "transparent" },
                }}>
                <MenuIcon sx={{ fontSize: 24 }} />
              </IconButton>
            </Toolbar>
          </AppBar>

          {/* Main content */}
          <Container
            maxWidth={false}
            sx={{
              py: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}>
            {/* Profile */}
            <Box
              sx={{
                mt: 0.5,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                px: 2,
              }}>
              <Avatar
                sx={{
                  width: 70,
                  height: 70,
                  mb: 1.25,
                  border: "6px solid #fff",
                  boxShadow: "0 6px 14px rgba(15,23,36,0.12)",
                  bgcolor: "primary.main",
                }}
                aria-hidden="true">
                {initials}
              </Avatar>
              <Typography variant="subtitle1" fontWeight={600}>
                {user?.name || "Đang tải"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                User ID: {user?.userId || "Đang tải"}
              </Typography>
            </Box>

            {/* Thông tin chi tiết */}
            <Box sx={{ width: "100%", mt: 2, px: 2 }}>
              <List disablePadding>
                <ListItem sx={{ py: 2, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 60 }}>
                    <PersonIcon sx={{ fontSize: 40 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Tên"
                    secondary={user?.name || "Đang tải"}
                    slotProps={{
                      primary: { fontWeight: 600, fontSize: 18 },
                      secondary: { fontSize: 16 },
                    }}
                  />
                </ListItem>

                <ListItem sx={{ py: 2, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 60 }}>
                    <CallIcon sx={{ fontSize: 40 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Số điện thoại"
                    secondary={user?.phone || "Đang tải"}
                    slotProps={{
                      primary: { fontWeight: 600, fontSize: 18 },
                      secondary: { fontSize: 16 },
                    }}
                  />
                </ListItem>

                <ListItem sx={{ py: 2, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 60 }}>
                    <EmailIcon sx={{ fontSize: 40 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={user?.email || "Đang tải"}
                    slotProps={{
                      primary: { fontWeight: 600, fontSize: 18 },
                      secondary: { fontSize: 16 },
                    }}
                  />
                </ListItem>

                <ListItem sx={{ py: 2, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 60 }}>
                    <Diversity1Icon sx={{ fontSize: 40 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Mối Quan hệ"
                    secondary={user?.relationship || "Đang tải"}
                    slotProps={{
                      primary: { fontWeight: 600, fontSize: 18 },
                      secondary: { fontSize: 16 },
                    }}
                  />
                </ListItem>
              </List>
            </Box>
          </Container>
        </Box>

        {/* Sidebar Drawer */}
        <Drawer
          anchor="right"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          PaperProps={{
            sx: {
              width: 250,
              borderTopLeftRadius: 12,
              borderBottomLeftRadius: 12,
              bgcolor: "#f9fafb",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            },
          }}>
          <Box sx={{}}>
            <Typography
              variant="h6"
              sx={{ color: "#1976d2", fontWeight: 700, p: 2, mb: 1, mt: 1 }}>
              Menu
            </Typography>
            <Divider sx={{ mb: 0 }} />
            <List>
              <ListItemButton
                sx={{ bgcolor: "#1976d2", color: "#fff" }}
                onClick={() => {
                  navigate("/GDChinh");
                  setSidebarOpen(false);
                }}>
                <PersonIcon />
                <ListItemText primary="Hồ sơ của tôi" sx={{ ml: 1 }} />
              </ListItemButton>
              <ListItemButton
                sx={{}}
                onClick={() => {
                  navigate("/GDChinh");
                  setSidebarOpen(false);
                }}>
                <PeopleAltIcon />
                <ListItemText primary="Học sinh của tôi" sx={{ ml: 1 }} />
              </ListItemButton>
              <ListItemButton
                sx={{}}
                onClick={() => {
                  navigate("/map");
                  setSidebarOpen(false);
                }}>
                <MapIcon />
                <ListItemText primary="Xem bản đồ" sx={{ ml: 1 }} />
              </ListItemButton>
              <ListItemButton
                onClick={() => {
                  navigate("/history");
                  setSidebarOpen(false);
                }}>
                <DirectionsBusIcon />
                <ListItemText primary="Lịch sử tuyến đường" sx={{ ml: 1 }} />
              </ListItemButton>
            </List>
          </Box>
          <Box sx={{ p: 2, borderTop: "1px solid #ddd" }}>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                color: "error.main",
                "&:hover": { bgcolor: "rgba(255,0,0,0.04)" },
              }}>
              <ListItemText primary="Đăng xuất" />
            </ListItemButton>
          </Box>
        </Drawer>
      </Box>
    </>
  );
}
