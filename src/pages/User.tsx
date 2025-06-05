import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LockResetIcon from "@mui/icons-material/LockReset";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import { ListUsers, userStatus } from "../api/model";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import API from "../api/axios";
import DrawerAddUser from "../components/DrawerAddUser";
import DrawerResetPassword from "../components/DrawerResetPassword";

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

const UserPage = () => {
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [openAddDrawer, setOpenAddDrawer] = useState<boolean>(false);
  const [openResetPwdDrawer, setOpenResetPwdDrawer] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>("");
  const [userID, setUserID] = useState<string>("");
  const [pageToken, setPageToken] = useState<string>("");
  const [previousToken, setPreviousToken] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(100);
  const [pageNumber, setPageNumber] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const {
    data: userResp,
    isLoading,
    error: isError,
  } = useQuery<ListUsers>({
    queryKey: ["listUsers", pageToken, pageSize],
    queryFn: async () => {
      const apiURL = new URL(
        `${import.meta.env.VITE_API_BASE_URL}/v1/auth/users`
      );
      apiURL.searchParams.set("pageSize", pageSize.toString());
      if (pageToken) {
        apiURL.searchParams.set("pageToken", pageToken);
      }

      const response = await API.get<ListUsers>(apiURL.toString());
      if (response.status !== 200) {
        throw Error("Failed to list users");
      }
      return response.data;
    },
  });

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setPageSize(parseInt(event.target.value));
  };

  const getPreviousToken = (): string => {
    const token = previousToken[previousToken.length - 1];
    setPreviousToken((t) => t.slice(0, t.length - 1));
    return token;
  };

  const handPreviousToken = (token: string) => {
    setPreviousToken((t) => [...t, token]);
  };

  const createUser = async (payload: {
    email: string;
    displayName: string;
    password: string;
  }): Promise<void> => {
    try {
      const response = await API.post("/v1/auth/users", payload);

      if (response.status === 200) {
        setSuccess("User created successfully");
        setShowSnackbar(true);
        return response.data;
      }

      if (response.status === 409) {
        throw new Error("The user with this email already exists");
      }

      throw new Error("Failed to create user");
    } catch {
      throw new Error("Failed to create user");
    }
  };

  const resetPassword = async (payload: {
    password: string;
  }): Promise<void> => {
    try {
      const response = await API.post(
        `/v1/auth/users/${userID}/reset-password`,
        payload
      );

      if (response.status === 200) {
        setSuccess("Password reset successfully");
        setShowSnackbar(true);
        return response.data;
      }

      throw new Error("Failed to create user");
    } catch {
      throw new Error("Failed to create user");
    }
  };

  const ITEM_HEIGHT = 48;

  const indexOfLastItem = (pageNumber + 1) * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;

  return (
    <>
      <Box>
        <Paper
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
          }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}>
            <Typography variant="h6">
              List of users
              <Button
                onClick={() => setOpenAddDrawer(true)}
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ whiteSpace: "nowrap", ml: 2 }}>
                Add New
              </Button>
            </Typography>
          </Stack>

          {isLoading && (
            <Box sx={{ padding: 2 }}>
              <Skeleton />
              <Skeleton animation="wave" />
              <Skeleton animation={false} />
            </Box>
          )}

          {isError && (
            <Alert severity="error" sx={{ mb: 1, mt: 1 }}>
              [Error] Something went wrong. Please try again later
            </Alert>
          )}

          {userResp && (
            <TableContainer component={Box}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                      No.
                    </TableCell>
                    <TableCell
                      sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                      Email
                    </TableCell>
                    <TableCell
                      sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                      Display Name
                    </TableCell>
                    <TableCell
                      sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                      Status
                    </TableCell>
                    <TableCell
                      sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userResp.users.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell width={"5%"} sx={{ whiteSpace: "nowrap" }}>
                        {idx + 1 + indexOfFirstItem}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row.email}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row.displayName}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Chip
                          variant="outlined"
                          size="small"
                          label={row.status}
                          color={getColorFromUserStatus(row.status)}
                        />
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <IconButton
                          aria-label="more"
                          id="long-button"
                          aria-controls={open ? "long-menu" : undefined}
                          aria-expanded={open ? "true" : undefined}
                          aria-haspopup="true"
                          onClick={handleClick}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          id="long-menu"
                          anchorEl={anchorEl}
                          open={open}
                          onClose={handleClose}
                          slotProps={{
                            list: {
                              "aria-labelledby": "long-button",
                            },
                            paper: {
                              style: {
                                maxHeight: ITEM_HEIGHT * 4.5,
                                width: "20ch",
                              },
                            },
                          }}>
                          <MenuItem
                            key="resetPassword"
                            onClick={() => {
                              setUserID(row.id);
                              setOpenResetPwdDrawer(true);
                              handleClose();
                            }}>
                            <LockResetIcon sx={{ mr: 1 }} />
                            Reset Password
                          </MenuItem>
                          <MenuItem key="enableUser" onClick={handleClose}>
                            <CheckCircleIcon sx={{ mr: 1 }} />
                            Activate
                          </MenuItem>
                          <MenuItem key="disableUser" onClick={handleClose}>
                            <BlockIcon sx={{ mr: 1 }} />
                            Deactivate
                          </MenuItem>
                          <MenuItem key="terminateUser" onClick={handleClose}>
                            <PersonOffIcon sx={{ mr: 1 }} />
                            Terminate
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <TablePagination
            component="div"
            rowsPerPage={pageSize}
            page={pageNumber}
            count={userResp ? userResp.users.length : 0}
            onPageChange={() => {}}
            onRowsPerPageChange={handlePageSizeChange}
            labelRowsPerPage="Page Size"
            labelDisplayedRows={() => ``}
            rowsPerPageOptions={[100, 200]}
            slotProps={{
              actions: {
                previousButton: {
                  disabled: previousToken.length >= 1 ? false : true,
                  onClick: () => {
                    if (pageNumber > 0 && previousToken.length > 0) {
                      setPageNumber(pageNumber - 1);
                      if (previousToken.length == 1) {
                        setPreviousToken([]);
                        setPageToken("");
                        return;
                      }

                      const token = getPreviousToken();
                      setPageToken(token);
                    }
                  },
                },
                nextButton: {
                  disabled:
                    userResp && userResp.nextPageToken.length > 0
                      ? false
                      : true,
                  onClick: () => {
                    if (userResp && userResp.nextPageToken.length > 0) {
                      const token = userResp.nextPageToken;
                      setPageNumber(pageNumber + 1);
                      setPageToken(token);
                      handPreviousToken(token);
                    }
                  },
                },
              },
            }}
          />
        </Paper>
      </Box>

      <DrawerAddUser
        open={openAddDrawer}
        onClose={() => setOpenAddDrawer(false)}
        onSubmit={createUser}
      />

      {openResetPwdDrawer && userID && (
        <DrawerResetPassword
          open={openResetPwdDrawer}
          id={userID}
          onClose={() => setOpenResetPwdDrawer(false)}
          onSubmit={resetPassword}
        />
      )}

      {success && showSnackbar && (
        <Snackbar
          open={showSnackbar}
          autoHideDuration={3000}
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert
            onClose={() => setShowSnackbar(false)}
            severity="success"
            sx={{ width: "100%" }}>
            {success}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

export default UserPage;
