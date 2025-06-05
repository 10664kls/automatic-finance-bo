import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  useTheme,
  useMediaQuery,
  Collapse,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import SettingsIcon from "@mui/icons-material/Settings";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HomeIcon from "@mui/icons-material/Home";
import { useAuth } from "../providers/Auth";

interface Props {
  open: boolean;
  toggleDrawer: () => void;
  closeToggleDrawer: () => void;
  drawerWidth: number;
  collapsedWidth: number;
}

const Sidebar: React.FC<Props> = ({
  open,
  toggleDrawer,
  drawerWidth,
  collapsedWidth,
  closeToggleDrawer,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [openSubmenus, setOpenSubmenus] = React.useState<{
    [key: string]: boolean;
  }>({});
  const { profile } = useAuth();

  const handleToggleSubmenu = (text: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [text]: !prev[text],
    }));
  };

  const menuItems = [
    {
      text: "Dashboard",
      icon: <HomeIcon />,
      path: "/",
    },
    {
      text: "Income Calculation",
      icon: <TrendingUpIcon />,
      path: "/income-calculations",
    },
    {
      text: "CIB Calculation",
      icon: <CreditCardIcon />,
      path: "/cib-calculations",
    },
    {
      text: "System Management",
      icon: <SettingsIcon />,
      path: "/system-management",
      children: [
        {
          text: "Currency",
          path: "/system-management-currency",
        },
        {
          text: "Wording",
          path: "/system-management-wording",
        },
      ],
    },
  ];

  if (profile && profile.isAdmin) {
    menuItems.push({
      text: "User Management",
      icon: <AdminPanelSettingsIcon />,
      path: "/user-management",
    });
  }

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={open}
      onClose={toggleDrawer}
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        "& .MuiDrawer-paper": {
          width: open ? drawerWidth : collapsedWidth,
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
          overflowX: "hidden",
          whiteSpace: "nowrap",
        },
      }}>
      <Toolbar sx={{ justifyContent: open ? "flex-start" : "center" }}>
        {open ? "Automatic Finance" : "AF"}
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem
              disablePadding
              sx={{
                display: "block",
                mt: {
                  xs: 1.5,
                  sm: 0.6,
                },
              }}>
              <ListItemButton
                onClick={() =>
                  item.children
                    ? handleToggleSubmenu(item.text)
                    : () => {
                        if (isMobile) {
                          closeToggleDrawer();
                        }
                      }
                }
                component={item.children ? "div" : NavLink}
                to={item.children ? undefined : item.path}
                sx={{
                  minHeight: 45,
                  justifyContent: open ? "initial" : "center",
                  px: open ? 2 : 1,
                  textAlign: open ? "left" : "center",
                  "&.active": {
                    backgroundColor: "#f5f5f5",
                    borderRight: "4px solid #3e2723",
                  },
                  display: open ? "flex" : "block",
                }}>
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 1 : "auto",
                    justifyContent: "center",
                  }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    open ? (
                      item.text
                    ) : (
                      <span
                        style={{
                          fontSize: "0.6rem",
                          display: "block",
                          textAlign: "center",
                        }}>
                        {item.text}
                      </span>
                    )
                  }
                  sx={{
                    opacity: open ? 1 : 1,
                    transition: "opacity 0.3s ease",
                  }}
                />
                {item.children &&
                  (openSubmenus[item.text] ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
            </ListItem>

            {/* Submenu Items */}
            {item.children && (
              <Collapse
                in={openSubmenus[item.text]}
                timeout="auto"
                unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItemButton
                      onClick={() => {
                        if (isMobile) {
                          closeToggleDrawer();
                        }
                      }}
                      key={child.text}
                      component={NavLink}
                      to={child.path}
                      sx={{
                        my: 0.5,
                        pl: open ? 6 : 2,
                        "&.active": {
                          backgroundColor: "#f5f5f5",
                          borderRight: "4px solid #3e2723",
                        },
                      }}>
                      <ListItemText
                        primary={
                          open ? (
                            child.text
                          ) : (
                            <span
                              style={{
                                fontSize: "0.6rem",
                                display: "block",
                                textAlign: "center",
                              }}>
                              {child.text}
                            </span>
                          )
                        }
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
