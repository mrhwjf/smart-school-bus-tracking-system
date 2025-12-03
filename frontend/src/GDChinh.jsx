import React, { useState, useEffect } from "react";
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
import MenuIcon from "@mui/icons-material/Menu";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import MapIcon from "@mui/icons-material/Map";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import PersonIcon from "@mui/icons-material/Person";
import ClassIcon from "@mui/icons-material/Class";
import WcIcon from "@mui/icons-material/Wc";
import CakeIcon from "@mui/icons-material/Cake";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useNavigate } from "react-router-dom";
import { blue } from "@mui/material/colors";
import { getAllUsers } from "./services/userService";
import { getAllStudents } from "./services/studentService";
import { getStudentsByParent } from "./services/studentService";
/**
 * GDChinh with dropdown selector for multiple students.
 * - Dropdown arrow is top-left (inside AppBar).
 * - Selecting a student updates the displayed card.
 */

export default function GDChinh() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null); // dropdown anchor
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const [students, setStudents] = React.useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStudentId, setCurrentStudentId] = useState(null);

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
    if (!parentId) {
      // not logged in - go to login
      navigate("/login");
      return;
    }

    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const items = await getStudentsByParent(parentId, token);
        if (!mounted) return;
        setStudents(items || []);
        if (items && items.length > 0) {
          // select first if none selected
          setCurrentStudentId((prev) =>
            prev ? prev : String(items[0].studentId ?? items[0].id)
          );
        } else {
          setCurrentStudentId(null);
        }
      } catch (err) {
        console.error("Load students failed:", err);
        if (mounted) setStudents([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentId]);
  // state: current selected student
  const student =
    students.find((s) => String(s.studentId) === String(currentStudentId)) ??
    (students.length > 0 ? students[0] : null);
  // dropdown handlers
  const handleMenuItemClick = () => setSidebarOpen(true);
  const handleLogout = () => {
    navigate("/login");
  };
  const handleOpenDropdown = (e) => setAnchorEl(e.currentTarget);
  const handleCloseDropdown = () => setAnchorEl(null);
  const handleSelectStudent = (id) => {
    setCurrentStudentId(String(id));
    setAnchorEl(null);
  };
  // safe initials for avatar
  const initials = student?.name
    ? student.name
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
            maxWidth: 400,
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
              {/* --- Dropdown arrow ở góc trái --- */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton
                  aria-controls={open ? "student-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  onClick={handleOpenDropdown}
                  size="small"
                  sx={{
                    width: 40,
                    height: 40,
                    color: "#FFFFFF",
                    bgcolor: "transparent",
                    "&:hover": { bgcolor: "transparent" },
                  }}>
                  <ArrowDropDownIcon />
                </IconButton>

                {/* Dropdown menu listing students */}
                <Menu
                  id="student-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleCloseDropdown}
                  MenuListProps={{ "aria-labelledby": "student-selector" }}>
                  {loading && <MenuItem disabled>Loading...</MenuItem>}
                  {!loading && students.length === 0 && (
                    <MenuItem disabled>No students</MenuItem>
                  )}
                  {students.map((s) => (
                    <MenuItem
                      key={s.studentId}
                      selected={s.studentId === String(currentStudentId)}
                      onClick={() => handleSelectStudent(s.studentId)}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar sx={{ width: 30, height: 30, fontSize: 12 }}>
                          {s.name
                            ? s.name
                                .split(" ")
                                .map((n) => (n ? n[0] : ""))
                                .slice(0, 2)
                                .join("")
                            : "?"}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {s.name ?? "Unknown"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {s.class?.name ?? "Unknown"} • {s.studentId}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>

              <Typography
                variant="h5"
                fontWeight={600}
                sx={{ p: 2, color: "#FFFFFF" }}>
                Thông tin học sinh
              </Typography>

              {/* menu icon ở phải */}
              <IconButton
                onClick={handleMenuItemClick}
                edge="end"
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
                {student?.name ??
                  (loading ? "Đang tải..." : "Không có dữ liệu")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Student ID:{" "}
                {student?.studentId ??
                  (loading ? "Đang tải..." : "Không có dữ liệu")}
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
                    secondary={
                      student?.name ??
                      (loading ? "Đang tải..." : "Không có dữ liệu")
                    }
                    slotProps={{
                      primary: { fontWeight: 600, fontSize: 18 },
                      secondary: { fontSize: 16 },
                    }}
                  />
                </ListItem>

                <ListItem sx={{ py: 2, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 60 }}>
                    <ClassIcon sx={{ fontSize: 40 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Lớp"
                    secondary={
                      student?.class?.name ??
                      (loading ? "Đang tải..." : "Không có dữ liệu")
                    }
                    slotProps={{
                      primary: { fontWeight: 600, fontSize: 18 },
                      secondary: { fontSize: 16 },
                    }}
                  />
                </ListItem>

                <ListItem sx={{ py: 2, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 60 }}>
                    <WcIcon sx={{ fontSize: 40 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Giới tính"
                    secondary={
                      student?.gender ??
                      (loading ? "Đang tải..." : "Không có dữ liệu")
                    }
                    slotProps={{
                      primary: { fontWeight: 600, fontSize: 18 },
                      secondary: { fontSize: 16 },
                    }}
                  />
                </ListItem>

                <ListItem sx={{ py: 2, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 60 }}>
                    <CakeIcon sx={{ fontSize: 40 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Ngày Sinh"
                    secondary={
                      student?.dateOfBirth ??
                      (loading ? "Đang tải..." : "Không có dữ liệu")
                    }
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
                sx={{}}
                onClick={() => {
                  navigate("/HoSoCuaToi");
                  setSidebarOpen(false);
                }}>
                <PersonIcon />
                <ListItemText primary="Hồ sơ của tôi" sx={{ ml: 1 }} />
              </ListItemButton>
              <ListItemButton
                sx={{ bgcolor: "#1976d2", color: "#fff" }}
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
