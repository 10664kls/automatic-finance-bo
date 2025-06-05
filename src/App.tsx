import React, { useEffect } from "react";
import {
  Box,
  Breadcrumbs,
  Link,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useLocation, Link as RouterLink, Outlet } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

const drawerWidth = 260;
const collapsedWidth = 0;

const SIDEBAR_KEY = "sidebarOpen";

const App = () => {
  const [drawerOpen, setDrawerOpen] = React.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(SIDEBAR_KEY) === "true";
    }
    return false;
  });

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (isSmallScreen) {
      setDrawerOpen(false);
    }
  }, [isSmallScreen]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SIDEBAR_KEY, drawerOpen.toString());
    }
  }, [drawerOpen]);

  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <Box sx={{ display: "flex" }}>
      <Navbar onToggleDrawer={() => setDrawerOpen(!drawerOpen)} />
      <Sidebar
        open={drawerOpen}
        toggleDrawer={() => setDrawerOpen(!drawerOpen)}
        closeToggleDrawer={() => setDrawerOpen(false)}
        drawerWidth={drawerWidth}
        collapsedWidth={collapsedWidth}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 7,
          overflowX: "auto",
        }}>
        <Breadcrumbs aria-label="breadcrumb" maxItems={3} sx={{ mb: 2, mt: 1 }}>
          <Link
            underline="hover"
            color="inherit"
            sx={{ display: "flex", alignItems: "center" }}
            component={RouterLink}
            to="/">
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Dashboard
          </Link>
          {pathnames.map((value, index) => {
            const to = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;
            return isLast ? (
              <Typography
                key={to}
                sx={{
                  color: "text.primary",
                  display: "flex",
                  alignItems: "center",
                  textTransform: "capitalize",
                }}>
                {value}
              </Typography>
            ) : (
              <Link
                sx={{
                  textTransform: "capitalize",
                }}
                key={to}
                component={RouterLink}
                to={to}
                underline="hover"
                color="inherit">
                {value}
              </Link>
            );
          })}
        </Breadcrumbs>
        <Outlet />
      </Box>
    </Box>
  );
};

export default App;
