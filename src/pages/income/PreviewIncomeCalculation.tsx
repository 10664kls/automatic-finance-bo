import type React from "react";
import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Typography,
  Button,
  Avatar,
  Tabs,
  Tab,
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
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  InterpreterMode as InterpreterModeIcon,
} from "@mui/icons-material";
import InventoryIcon from "@mui/icons-material/Inventory";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link as RouterLink, useParams } from "react-router-dom";
import { Calculation } from "../../api/model";
import API from "../../api/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { formatCurrency } from "../../utils/format";
import TabIncomeSalary from "../../components/TabIncomeSalary";
import TabIncomeAllowance from "../../components/TabIncomeAllowance";
import TabIncomeCommission from "../../components/TabIncomeCommission";
import { AxiosError } from "axios";
import FormattedNumberInput from "../../components/FormattedNumberInput";
import { cleanNumberForAPI } from "../../utils/number";

const PreviewIncomeCalculation: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [basicSalary, setBasicSalary] = useState<string>("");

  const recalculateMutation = useMutation({
    mutationFn: async (req: {
      basicSalaryFromInterview: string;
      calculation: Calculation;
    }) => {
      try {
        const response = await API.put<{ calculation: Calculation }>(
          `/v1/incomes/calculations/${req.calculation.number}`,
          {
            basicSalaryFromInterview: cleanNumberForAPI(
              req.basicSalaryFromInterview
            ),
            monthlySalaries: req.calculation.salaryBreakdown.monthlySalaries,
            allowances: req.calculation.allowanceBreakdown.allowances,
            commissions: req.calculation.commissionBreakdown.commissions,
          }
        );
        if (response.status !== 200) {
          throw Error("Failed to recalculate income");
        }

        return response.data.calculation;
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          if (
            error.response?.status === 400 &&
            error.response.data?.error?.status === "FAILED_PRECONDITION"
          ) {
            setError(error.response.data.error.message);
            throw new Error(error.response.data.error.message);
          }
        }

        setError("Failed to recalculate income. Please try again later.");
        throw error;
      }
    },
    mutationKey: ["recalculate"],
    onSuccess: () => {
      setShowSnackbar(true);
      setSuccess("Recalculate income successfully");
      setError(null);
      setIsEditing(false);
      queryClient.invalidateQueries({
        queryKey: ["getIncomeCalculation"],
      });
    },
    onError: () => {
      setShowSnackbar(true);
      setSuccess(null);
    },
  });

  const query = useParams();
  const queryClient = useQueryClient();

  const {
    data: calculation,
    isLoading: isCalculationLoading,
    error: getCalculationError,
  } = useQuery<Calculation>({
    queryKey: ["getIncomeCalculation"],
    queryFn: async () => {
      const response = await API.get<{ calculation: Calculation }>(
        `/v1/incomes/calculations/${query.number}`
      );
      if (response.status !== 200) {
        throw Error("Failed to get calculation");
      }

      return response.data.calculation;
    },
    enabled: !!query.number,
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
      queryClient.invalidateQueries({ queryKey: ["getIncomeCalculation"] });
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

  const handleExportToExcel = async () => {
    try {
      const resp = await API.get(
        `${import.meta.env.VITE_API_BASE_URL}/v1/incomes/calculations/${
          query.number
        }/export-to-excel`,
        { responseType: "blob" }
      );
      if (resp.status !== 200) {
        throw new Error(resp.statusText);
      }

      const blob = resp.data;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Income_Calculation_${query.number}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowSnackbar(true);
      setSuccess("Export Income Calculation to Excel successfully");
    } catch {
      setError("Failed to export to Excel. Please try again.");
      setShowSnackbar(true);
    }
  };

  const handleBasicSalaryFromInterviewClose = () => {
    setIsEditing(false);
  };

  const handOnSubmitBasicSalaryFromInterview = async (
    calculation: Calculation
  ) => {
    recalculateMutation.mutate({
      basicSalaryFromInterview: basicSalary,
      calculation: calculation,
    });
  };

  const handBasicSalaryFromInterviewOnClick = (calculation: Calculation) => {
    setIsEditing(true);
    setBasicSalary(calculation.basicSalaryFromInterview.toString());
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
              onClick={handleExportToExcel}
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

        {calculation && !isCalculationLoading && !getCalculationError && (
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
                    background: "background.default",
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
                        sx={{ mt: 1 }}>
                        {formatCurrency(
                          calculation.totalBasicSalary,
                          calculation.account.currency
                        )}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Monthly Average
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight="medium"
                        sx={{ mt: 1 }}>
                        {formatCurrency(
                          calculation.monthlyAverageIncome,
                          calculation.account.currency
                        )}
                      </Typography>
                    </Box>
                    {calculation.product !== "SA" && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Other Income (Monthly Average)
                        </Typography>
                        <Typography
                          variant="h5"
                          fontWeight="medium"
                          sx={{ mt: 1 }}>
                          {formatCurrency(
                            calculation.monthlyOtherIncome,
                            calculation.account.currency
                          )}
                        </Typography>
                      </Box>
                    )}
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
                        bgcolor: "background.neutral",
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
                        {formatCurrency(calculation.exchangeRate)}
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
                    md: `repeat(${calculation.product === "SA" ? 4 : 3}, 1fr)`,
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
                        bgcolor: "background.neutral",
                      }}>
                      <InterpreterModeIcon />
                    </Avatar>

                    {calculation.status === "PENDING" && (
                      <>
                        {!isEditing ? (
                          <Button
                            onClick={() => {
                              handBasicSalaryFromInterviewOnClick(calculation);
                            }}
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}>
                            Edit
                          </Button>
                        ) : (
                          <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
                            <Button
                              onClick={() => {
                                handOnSubmitBasicSalaryFromInterview(
                                  calculation
                                );
                              }}
                              variant="contained"
                              size="small"
                              startIcon={<SaveIcon />}>
                              Save changes
                            </Button>
                            <Button
                              onClick={handleBasicSalaryFromInterviewClose}
                              variant="outlined"
                              size="small"
                              startIcon={<CloseIcon />}>
                              Discard
                            </Button>
                          </Box>
                        )}
                      </>
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    Base salary (Interview)
                  </Typography>

                  {!isEditing ? (
                    <Typography variant="h5" fontWeight="medium" sx={{ mt: 1 }}>
                      {formatCurrency(
                        calculation.basicSalaryFromInterview,
                        calculation.account.currency
                      )}
                    </Typography>
                  ) : (
                    <Box
                      sx={{
                        mt: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",
                      }}>
                      <FormattedNumberInput
                        type="text"
                        size="small"
                        autoFocus
                        value={basicSalary === "0" ? "" : basicSalary}
                        sx={{
                          flex: 1,
                          minWidth: "150px",
                          "& .MuiOutlinedInput-root": {
                            fontSize: "1.25rem",
                            fontWeight: "medium",
                          },
                        }}
                        onChange={(e) => setBasicSalary(e)}
                        onKeyDown={(e) => {
                          // Allow: backspace, delete, tab, escape, enter, decimal point
                          const allowedKeys = [
                            "Backspace",
                            "Delete",
                            "Tab",
                            "Escape",
                            "Enter",
                            "ArrowLeft",
                            "ArrowRight",
                            "ArrowUp",
                            "ArrowDown",
                            "Home",
                            "End",
                            ".",
                          ];

                          // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
                          if (
                            e.ctrlKey &&
                            ["a", "c", "v", "x", "z"].includes(
                              e.key.toLowerCase()
                            )
                          ) {
                            return;
                          }

                          // Allow navigation and special keys
                          if (allowedKeys.includes(e.key)) {
                            return;
                          }

                          // Allow numbers 0-9
                          if (e.key >= "0" && e.key <= "9") {
                            return;
                          }

                          // Block everything else
                          e.preventDefault();
                        }}
                      />
                    </Box>
                  )}
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
                    <Avatar>
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
                    <Avatar>
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
                    <Avatar>
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
                      <Avatar>
                        <TrendingUp />
                      </Avatar>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Other Income
                    </Typography>
                    <Typography variant="h5" fontWeight="medium" sx={{ mt: 1 }}>
                      {formatCurrency(
                        calculation.eightyPercentOfMonthlyOtherIncome,
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

      {openConfirm && (
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
      )}
    </>
  );
};

export default PreviewIncomeCalculation;
