import React from "react";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Typography,
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  Container,
  CssBaseline,
  useTheme,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ErrorIcon from "@mui/icons-material/Error";
import screenshot from "./namaste-dog-smiling.png"; // chỉnh path nếu cần
import { useNavigate } from "react-router-dom";
import MapIcon from "@mui/icons-material/Map";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
export default function GDChinh() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const theme = useTheme();
  const appContainerRef = React.useRef(null);
  const navigate = useNavigate();

  const handleMenuItemClick = () => {
    setSidebarOpen(true);
  };

  const handleLogout = () => {
    // Xử lý đăng xuất ở đây
    console.log("Đăng xuất");
  };

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
        {/* app container - giới hạn chiều rộng (mobile preview) */}
        <Box
          sx={{
            height: "100%",
            maxWidth: 400,
            borderRadius: 2,
            bgcolor: "background.paper",
            overflow: "visible",
            boxShadow: 2,
          }}>
          {/* Header */}
          <AppBar position="static" color="transparent" elevation={0}>
            <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
              <Box sx={{ width: 36 /* left placeholder */ }} />
              <IconButton
                onClick={handleMenuItemClick}
                edge="end"
                aria-label="menu"
                sx={{
                  width: 40,
                  height: 40,
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
              }}>
              <Avatar
                sx={{
                  width: 70,
                  height: 70,
                  mb: 1.25,
                  border: "6px solid #fff",
                  boxShadow: "0 6px 14px rgba(15,23,36,0.12)",
                  bgcolor: "linear-gradient(180deg,#0b1220,#0f1824)", // fallback
                }}
                aria-hidden="true">
                {/* nếu muốn chữ trong avatar: */}
              </Avatar>

              <Typography variant="subtitle1" fontWeight={600}>
                Ajmal Khan
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Student ID: D001
              </Typography>
            </Box>

            {/* Card wrapper */}
            <Box
              sx={{
                maxWidth: "100%",
                mt: 2,
                px: 1,
              }}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: "6px solid #dcdcdc",
                  boxShadow: "0 8px 20px rgba(15,23,36,0.06)",
                  overflow: "visible",
                }}>
                <CardHeader
                  avatar={null}
                  title={
                    <Typography variant="subtitle1" fontWeight={600}>
                      Thông tin chi tiết học sinh
                    </Typography>
                  }
                  sx={{ pb: 0, px: 2 }}
                />

                <CardContent sx={{ px: 2, pt: 1 }}>
                  <Box
                    sx={{
                      width: "100%",
                      height: 230,
                      borderRadius: 2,
                      border: "1px solid #ececec",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#fff",
                    }}>
                    {/* Nếu muốn dùng CardMedia */}
                    <CardMedia
                      component="img"
                      image={screenshot}
                      alt="Picture"
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "block",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
              <Box sx={{ mt: 1.8, textAlign: "left", px: 1 }}>
                <Typography sx={{ fontSize: 18 }}>Student ID: D001</Typography>
                <Typography sx={{ fontSize: 18 }}>
                  Gaurdian name: Your đá đỳ
                </Typography>
                <Typography sx={{ fontSize: 18 }}>Name: Phonk</Typography>
                <Typography sx={{ fontSize: 18 }}>Class: 5A</Typography>
                <Typography sx={{ fontSize: 18 }}>Gender: MALE</Typography>
                <Typography sx={{ fontSize: 18 }}>
                  Date of birth: 18-11-2005
                </Typography>
              </Box>
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
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Menu
            </Typography>
            <Divider sx={{ mb: 0 }} />
            <List>
              <ListItemButton
                sx={{}}
                onClick={() => {
                  navigate("/");
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
              <ListItemButton
                onClick={() => {
                  console.log("Gọi khẩn cấp");
                  setSidebarOpen(false);
                }}>
                <ErrorIcon />
                <ListItemText primary="Gọi khẩn cấp" sx={{ ml: 1 }} />
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
