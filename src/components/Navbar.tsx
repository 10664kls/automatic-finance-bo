import React from "react";
import {
  AppBar,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  ListItemIcon,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../providers/Auth";

interface Props {
  onToggleDrawer: () => void;
}

function stringAvatar(name: string) {
  return `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`;
}

const Navbar: React.FC<Props> = ({ onToggleDrawer }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const { logout, profile } = useAuth();

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "#fff",
        color: "#000",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        borderBottom: "1px solid #ddd",
      }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={onToggleDrawer} edge="start" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Automatic Finance | Krungsri Laos
          </Typography>
        </Box>
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
          <Avatar>
            {profile ? stringAvatar(profile.displayName) : "Guest"}
          </Avatar>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => logout()}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
