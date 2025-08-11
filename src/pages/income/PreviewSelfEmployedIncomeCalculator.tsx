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
import { CalendarToday, FileDownload, Check } from "@mui/icons-material";
import InventoryIcon from "@mui/icons-material/Inventory";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link as RouterLink, useParams } from "react-router-dom";
import { SelfEmployedCalculation } from "../../api/model";
import API from "../../api/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { formatCurrency } from "../../utils/format";
import TableSelfEmployedMonthlyIncome from "../../components/TableSelfEmployedMonthlyIncome";

const PreviewSelfEmployedIncomeCalculator: React.FC = () => {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const query = useParams();
  const queryClient = useQueryClient();

  const {
    data: calculation,
    isLoading: isCalculationLoading,
    error: getCalculationError,
  } = useQuery<SelfEmployedCalculation>({
    queryKey: ["getSelfEmployedIncomeCalculation"],
    queryFn: async () => {
      const response = await API.get<{ calculation: SelfEmployedCalculation }>(
        `/v1/selfemployed/calculations/${query.number}`
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
      const response = await API.patch(
        `/v1/selfemployed/calculations/${query.number}/complete`
      );
      if (response.status !== 200) {
        setError("Failed to complete calculation. Please try again.");
        setShowSnackbar(true);
        return;
      }

      setSuccess("Calculation completed successfully!");
      setShowSnackbar(true);
      queryClient.invalidateQueries({
        queryKey: ["getSelfEmployedIncomeCalculation"],
      });
      return;
    } catch {
      setError("Failed to complete calculation. Please try again.");
      setShowSnackbar(true);
      return;
    }
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
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 3,
                    }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Income
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight="medium"
                        sx={{ my: 1 }}>
                        {formatCurrency(calculation.totalIncome)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Monthly Average
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight="medium"
                        sx={{ my: 1 }}>
                        {formatCurrency(calculation.monthlyAverageIncome)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {` Monthly Average by Margin (${calculation.marginPercentage}%)`}
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight="medium"
                        sx={{ my: 1 }}>
                        {formatCurrency(calculation.monthlyAverageByMargin)}
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

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Business Segment
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="medium"
                      sx={{ my: 1 }}>
                      {calculation.businessType.name}
                    </Typography>
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

            {/* Detailed Income Tabs */}
            <Box sx={{ mb: 4 }}>
              <TableSelfEmployedMonthlyIncome calculation={calculation} />

              <Stack
                direction="row"
                spacing={2}
                sx={{ mt: 2 }}
                justifyContent="flex-end">
                <Button
                  startIcon={<ArrowBackIcon />}
                  component={RouterLink}
                  to="/income-calculations?type=self-employed"
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

export default PreviewSelfEmployedIncomeCalculator;
