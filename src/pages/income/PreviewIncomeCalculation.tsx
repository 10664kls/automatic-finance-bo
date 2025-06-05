"use client";

import type React from "react";
import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Typography,
  useTheme,
  Button,
  Avatar,
  Tabs,
  Tab,
  alpha,
  Stack,
  Skeleton,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  MonetizationOn,
  TrendingUp,
  Savings,
  WorkOutline,
  CalendarToday,
  FileDownload,
  Check,
} from "@mui/icons-material";
import InventoryIcon from "@mui/icons-material/Inventory";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link as RouterLink, useParams } from "react-router-dom";
import { Calculation } from "../../api/model";
import API from "../../api/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { formatCurrency } from "../../utils/format";
import TabIncomeSalary from "../../components/TabIncomeSalary";
import TabIncomeAllowance from "../../components/TabIncomeAllowance";
import TabIncomeCommission from "../../components/TabIncomeCommission";

const PreviewIncomeCalculation: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const query = useParams();
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const queryClient = useQueryClient();

  const {
    data: calculation,
    isLoading: isCalculationLoading,
    error: getCalculationError,
  } = useQuery<Calculation>({
    queryKey: ["getCalculation"],
    queryFn: async () => {
      const response = await API.get<{ calculation: Calculation }>(
        `/v1/incomes/calculations/${query.number}`
      );
      if (response.status !== 200) {
        throw Error("Failed to get calculation");
      }

      return response.data.calculation;
    },
  });

  const completeCalculation = async () => {
    setError(null);
    setSuccess(null);
    setShowSnackbar(false);

    try {
      const response = await API.post(
        `/v1/incomes/calculations/${query.number}/complete`
      );
      if (response.status !== 200) {
        setError("Failed to complete calculation. Please try again.");
        setShowSnackbar(true);
        return;
      }

      setSuccess("Calculation completed successfully!");
      setShowSnackbar(true);
      queryClient.invalidateQueries({ queryKey: ["getCalculation"] });
      return;
    } catch {
      setError("Failed to complete calculation. Please try again.");
      setShowSnackbar(true);
      return;
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <>
      <Box sx={{ p: 1, mx: "auto" }}>
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Income Calculation Preview
          </Typography>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Button
              variant="contained"
              startIcon={<FileDownload />}
              sx={{
                textTransform: "none",
                minWidth: "100px",
              }}>
              Export
            </Button>
          </Box>
        </Box>

        {isCalculationLoading && (
          <>
            <Skeleton />
            <Skeleton animation="wave" />
            <Skeleton animation={false} />
          </>
        )}

        {getCalculationError && (
          <Alert severity="error" sx={{ mb: 1, mt: 1 }}>
            [Error] Something went wrong. Please try again later
          </Alert>
        )}

        {calculation && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {`Data based on monthly statement files for the last ${calculation.periodInMonth} months period`}
            </Typography>

            {/* Account Overview and Total Income Cards */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
                gap: 3,
                mb: 4,
              }}>
              {/* Main summary card */}
              <Card
                sx={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  position: "relative",
                }}>
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "100%",
                    height: "100%",
                    background: alpha(theme.palette.background.default, 0.5),
                    zIndex: 0,
                  }}
                />
                <CardContent sx={{ position: "relative", zIndex: 1, p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 3,
                    }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Net Income/Month
                      </Typography>
                      <Typography variant="h3" fontWeight="bold" sx={{ my: 1 }}>
                        {formatCurrency(calculation.monthlyNetIncome)}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: `repeat(${
                          calculation.product !== "SA" ? 3 : 2
                        }, 1fr)`,
                      },
                      gap: 3,
                    }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Basic Salary
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight="medium"
                        sx={{ mt: 1, color: primaryColor }}>
                        {formatCurrency(
                          calculation.totalBasicSalary,
                          calculation.account.currency
                        )}
                      </Typography>
                    </Box>
                    {calculation.product !== "SA" && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Total Other Income
                        </Typography>
                        <Typography
                          variant="h5"
                          fontWeight="medium"
                          sx={{ mt: 1, color: primaryColor }}>
                          {formatCurrency(
                            calculation.totalOtherIncome,
                            calculation.account.currency
                          )}
                        </Typography>
                      </Box>
                    )}
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Monthly Average
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight="medium"
                        sx={{ mt: 1, color: primaryColor }}>
                        {formatCurrency(
                          calculation.monthlyAverageIncome,
                          calculation.account.currency
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Account info card */}
              <Card
                sx={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                }}>
                <CardContent
                  sx={{
                    p: 3,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: primaryColor,
                        width: 48,
                        height: 48,
                        mr: 2,
                      }}>
                      {getInitials(calculation.account.displayName)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="medium">
                        {calculation.account.displayName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {calculation.account.number} (
                        {calculation.account.currency})
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Product
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <InventoryIcon
                        fontSize="small"
                        sx={{ mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="body1" fontWeight="medium">
                        {calculation.product}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Facility/LO Number
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <ConfirmationNumberIcon
                        fontSize="small"
                        sx={{ mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="body1" fontWeight="medium">
                        {calculation.number}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Statement Period
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <CalendarToday
                        fontSize="small"
                        sx={{ mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="body1" fontWeight="medium">
                        {`${DateTime.fromISO(calculation.startedAt, {
                          zone: "Asia/Vientiane",
                        }).toFormat("dd/MM/yyyy")} to ${DateTime.fromISO(
                          calculation.endedAt,
                          {
                            zone: "Asia/Vientiane",
                          }
                        ).toFormat("dd/MM/yyyy")}`}
                      </Typography>
                    </Box>
                  </Box>

                  {calculation.account.currency !== "LAK" && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Exchange Rate
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight="medium"
                        sx={{ mt: 1 }}>
                        {formatCurrency(20598)}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* Income Summary Cards */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight="500" gutterBottom>
                Income Breakdown
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {`Distribution of income by category based on ${calculation.periodInMonth}-month statement period`}
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: `repeat(${calculation.product === "SA" ? 3 : 4}, 1fr)`,
                  },
                  gap: 3,
                }}>
                <Card
                  sx={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    position: "relative",
                    p: 3,
                  }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(primaryColor, 0.1),
                        color: primaryColor,
                      }}>
                      <MonetizationOn />
                    </Avatar>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Basic Salary
                  </Typography>
                  <Typography variant="h5" fontWeight="medium" sx={{ mt: 1 }}>
                    {formatCurrency(
                      calculation.source.basicSalary.monthlyAverage,
                      calculation.account.currency
                    )}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}>
                    Monthly base
                  </Typography>
                </Card>

                <Card
                  sx={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    position: "relative",
                    p: 3,
                  }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(primaryColor, 0.1),
                        color: primaryColor,
                      }}>
                      <Savings />
                    </Avatar>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Allowances
                  </Typography>
                  <Typography variant="h5" fontWeight="medium" sx={{ mt: 1 }}>
                    {formatCurrency(
                      calculation.source.allowance.monthlyAverage,
                      calculation.account.currency
                    )}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}>
                    Monthly average
                  </Typography>
                </Card>

                <Card
                  sx={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    position: "relative",
                    p: 3,
                  }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(primaryColor, 0.1),
                        color: primaryColor,
                      }}>
                      <WorkOutline />
                    </Avatar>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Commission/OT
                  </Typography>
                  <Typography variant="h5" fontWeight="medium" sx={{ mt: 1 }}>
                    {formatCurrency(
                      calculation.source.commission.monthlyAverage,
                      calculation.account.currency
                    )}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}>
                    Monthly average
                  </Typography>
                </Card>

                {calculation.product !== "SA" && (
                  <Card
                    sx={{
                      borderRadius: "16px",
                      overflow: "hidden",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                      position: "relative",
                      p: 3,
                    }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                      }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(primaryColor, 0.1),
                          color: primaryColor,
                        }}>
                        <TrendingUp />
                      </Avatar>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Other Income
                    </Typography>
                    <Typography variant="h5" fontWeight="medium" sx={{ mt: 1 }}>
                      {formatCurrency(
                        calculation.source.other.monthlyAverage,
                        calculation.account.currency
                      )}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}>
                      Monthly average (80%)
                    </Typography>
                  </Card>
                )}
              </Box>
            </Box>

            {/* Detailed Income Tabs */}
            <Box sx={{ mb: 4 }}>
              <Card
                sx={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  textColor="primary"
                  indicatorColor="primary"
                  sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tab label="Fixed Income Salary" />
                  <Tab label="Allowance Income" />
                  <Tab label="Commission/OT" />
                </Tabs>

                {/* Fixed Income Salary Tab */}
                {activeTab === 0 && (
                  <TabIncomeSalary calculation={calculation} />
                )}

                {/* Allowance Income Tab */}
                {activeTab === 1 && (
                  <TabIncomeAllowance calculation={calculation} />
                )}

                {/* Commission/OT Tab */}
                {activeTab === 2 && (
                  <TabIncomeCommission calculation={calculation} />
                )}
              </Card>
              <Stack
                direction="row"
                spacing={2}
                sx={{ mt: 2 }}
                justifyContent="flex-end">
                <Button
                  startIcon={<ArrowBackIcon />}
                  component={RouterLink}
                  to="/income-calculations"
                  variant="outlined"
                  sx={{ whiteSpace: "nowrap" }}>
                  Back
                </Button>
                {calculation.status === "PENDING" && (
                  <Button
                    variant="contained"
                    onClick={() => setOpenConfirm(true)}
                    startIcon={<Check />}
                    sx={{ textTransform: "none", whiteSpace: "nowrap" }}>
                    Make as Complete
                  </Button>
                )}
              </Stack>
            </Box>
          </>
        )}
      </Box>

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

      <Snackbar
        open={!!error}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={5000}
        onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirm Completion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Once this calculation is marked as complete, it can no longer be
            edited. Are you sure you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenConfirm(false)}
            color="primary"
            variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setOpenConfirm(false);
              completeCalculation();
            }}
            color="primary"
            variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PreviewIncomeCalculation;
