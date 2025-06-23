"use client";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { useState } from "react";
import API from "../api/axios";
import { useAuth } from "../providers/Auth";
import { userStatus } from "../api/model";

interface UpdateDisplayNamePayload {
  displayName: string;
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const MyProfilePage = () => {
  // Profile editing states
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [originalDisplayName, setOriginalDisplayName] = useState("");

  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState<ChangePasswordPayload>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Notification states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Loading states
  const [isUpdatingDisplayName, setIsUpdatingDisplayName] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const { profile, getProfile } = useAuth();

  const showSnackbar = (
    message: string,
    severity: "success" | "error" = "success"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Display name editing functions
  const handleEditDisplayName = () => {
    setDisplayName(profile?.displayName || "");
    setIsEditingDisplayName(true);
  };

  const handleCancelEditDisplayName = () => {
    setDisplayName(originalDisplayName);
    setIsEditingDisplayName(false);
  };

  const handleSaveDisplayName = async () => {
    if (!displayName.trim()) {
      showSnackbar("Display name cannot be empty", "error");
      return;
    }

    setIsUpdatingDisplayName(true);
    try {
      const payload: UpdateDisplayNamePayload = {
        displayName: displayName.trim(),
      };
      const response = await API.patch(
        "/v1/auth/profile/change-display-name",
        payload
      );

      if (response.status === 200) {
        setOriginalDisplayName(displayName);
        setIsEditingDisplayName(false);
        showSnackbar("Display name updated successfully");
        getProfile();
      } else {
        throw new Error("Failed to update display name");
      }
    } catch {
      showSnackbar("Failed to update display name", "error");
    } finally {
      setIsUpdatingDisplayName(false);
    }
  };

  // Password change functions
  const handlePasswordChange = (
    field: keyof ChangePasswordPayload,
    value: string
  ) => {
    setPasswordData({ ...passwordData, [field]: value });
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  const validatePasswordChange = (): string | null => {
    if (!passwordData.currentPassword) {
      return "Current password is required";
    }
    if (!passwordData.newPassword) {
      return "New password is required";
    }
    if (passwordData.newPassword.length < 8) {
      return "New password must be at least 8 characters long";
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return "New passwords do not match";
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      return "New password must be different from current password";
    }
    return null;
  };

  const handleChangePassword = async () => {
    const validationError = validatePasswordChange();
    if (validationError) {
      showSnackbar(validationError, "error");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const response = await API.post("/v1/auth/profile/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.status === 200) {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setIsChangingPassword(false);
        showSnackbar("Password changed successfully");
      } else {
        throw new Error("Failed to change password");
      }
    } catch {
      showSnackbar(
        "Failed to change password. Please check your current password.",
        "error"
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsChangingPassword(false);
  };

  const getColorFromUserStatus = (status: userStatus) => {
    switch (status) {
      case "ENABLED":
        return "primary";
      case "DISABLED":
        return "warning";
      case "CLOSED":
        return "error";
      default:
        return "primary";
    }
  };

  return (
    <Box sx={{ mx: "auto" }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Information Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <PersonIcon />
                </Avatar>
              }
              title="Profile Information"
              subheader="Manage your personal information"
            />
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Email Address
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {profile?.email}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Display Name
                </Typography>
                {isEditingDisplayName ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      size="small"
                      fullWidth
                      autoFocus
                    />
                    <IconButton
                      onClick={handleSaveDisplayName}
                      disabled={isUpdatingDisplayName}
                      color="primary"
                      size="small">
                      <SaveIcon />
                    </IconButton>
                    <IconButton
                      onClick={handleCancelEditDisplayName}
                      size="small">
                      <CancelIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body1">
                      {profile?.displayName}
                    </Typography>
                    <IconButton onClick={handleEditDisplayName} size="small">
                      <EditIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Account Status
                </Typography>
                <Chip
                  variant="outlined"
                  label={profile?.status}
                  color={getColorFromUserStatus(profile?.status as userStatus)}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Password Change Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <LockIcon />
                </Avatar>
              }
              title="Security"
              subheader="Change your password"
            />
            <CardContent>
              {!isChangingPassword ? (
                <Box>
                  <Button
                    variant="outlined"
                    onClick={() => setIsChangingPassword(true)}
                    startIcon={<LockIcon />}>
                    Change Password
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    label="Current Password"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      handlePasswordChange("currentPassword", e.target.value)
                    }
                    fullWidth
                    size="small"
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                togglePasswordVisibility("current")
                              }
                              edge="end"
                              size="small">
                              {showPasswords.current ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <TextField
                    label="New Password"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      handlePasswordChange("newPassword", e.target.value)
                    }
                    fullWidth
                    size="small"
                    helperText="Must be at least 8 characters long"
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility("new")}
                              edge="end"
                              size="small">
                              {showPasswords.new ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <TextField
                    label="Confirm New Password"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      handlePasswordChange("confirmPassword", e.target.value)
                    }
                    fullWidth
                    size="small"
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                togglePasswordVisibility("confirm")
                              }
                              edge="end"
                              size="small">
                              {showPasswords.confirm ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      mt: 1,
                      justifyContent: "flex-end",
                    }}>
                    <Button
                      variant="outlined"
                      onClick={handleCancelPasswordChange}
                      size="small">
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleChangePassword}
                      disabled={isUpdatingPassword}
                      size="small">
                      {isUpdatingPassword ? "Updating..." : "Update Password"}
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyProfilePage;
