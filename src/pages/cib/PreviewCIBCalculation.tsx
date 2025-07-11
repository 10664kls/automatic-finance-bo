import React from "react";
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
} from "@mui/material";
import { CalendarToday, FileDownload } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import API from "../../api/axios";
import { CIBCalculation } from "../../api/model";
import { formatCurrency, formatWithoutCurrency } from "../../utils/format";
import TabCIBContract from "../../components/TabCIBContracts";
import TabCIBActiveContract from "../../components/TabCIBActiveContract";
import TabCIBClosedContract from "../../components/TabCIBClosedContract";

const PreviewCIBCalculation: React.FC = () => {
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const query = useParams();
  const theme = useTheme();

  const {
    data: calculation,
    isLoading: isCalculationLoading,
    error: getCalculationError,
  } = useQuery<CIBCalculation>({
    queryKey: ["getCIBCalculation"],
    queryFn: async () => {
      const response = await API.get<{ calculation: CIBCalculation }>(
        `/v1/cib/calculations/${query.number}`
      );
      if (response.status !== 200) {
        throw Error("Failed to get calculation");
      }

      return response.data.calculation;
    },
    enabled: !!query.number,
  });

  const primaryColor = theme.palette.primary.main;

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleExportToExcel = async () => {
    try {
      const resp = await API.get(
        `${import.meta.env.VITE_API_BASE_URL}/v1/cib/calculations/${
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
      link.download = `CIB_Calculation_${query.number}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowSnackbar(true);
      setSuccess("Export CIB Calculation to Excel successfully");
    } catch {
      setError("Failed to export to Excel. Please try again.");
      setShowSnackbar(true);
    }
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
            CIB Calculation Preview
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
              Data based on the CIB installment that was received on{" "}
              {new Date(calculation.createdAt).toLocaleDateString("lo-LA")}
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
                gap: 3,
                mb: 4,
              }}>
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
                      alignItems: "flex-start",
                      mb: 3,
                    }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Loan
                      </Typography>
                      <Typography variant="h3" fontWeight="bold" sx={{ my: 1 }}>
                        {formatWithoutCurrency(
                          calculation.aggregateQuantity.total
                        )}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                      gap: 3,
                    }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Closed Loan
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight="medium"
                        sx={{ mt: 1, color: primaryColor }}>
                        {formatWithoutCurrency(
                          calculation.aggregateQuantity.closed
                        )}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Active Loan
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight="medium"
                        sx={{ mt: 1, color: primaryColor }}>
                        {formatWithoutCurrency(
                          calculation.aggregateQuantity.active
                        )}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Installment (CIB)
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight="medium"
                        sx={{ mt: 1, color: primaryColor }}>
                        {formatCurrency(calculation.totalInstallmentInLAK)}
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
                      {getInitials(calculation.customer.displayName)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="medium">
                        {calculation.customer.displayName}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Facility/LO Number
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="medium"
                      sx={{ mt: 1 }}>
                      {calculation.number}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Created Date
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <CalendarToday
                        fontSize="small"
                        sx={{ mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="body1" fontWeight="medium">
                        {new Date(calculation.createdAt).toLocaleDateString(
                          "lo-LA"
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight="500" gutterBottom>
                Distribution of CIB by Bank
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: `repeat(${
                      calculation.aggregateByBankCode.length > 3
                        ? 4
                        : calculation.aggregateByBankCode.length
                    }, 1fr)`,
                  },
                  gap: 3,
                }}>
                {calculation.aggregateByBankCode.map((item) => (
                  <Card
                    key={item.bankCode}
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
                        alignItems: "start",
                        justifyContent: "space-between",
                        mb: 2,
                      }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(primaryColor, 0.1),
                          color: primaryColor,
                        }}>
                        <AccountBalanceIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="medium">
                        {item.bankCode}
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight="medium" sx={{ mt: 1 }}>
                      {formatWithoutCurrency(item.quantity)}
                    </Typography>
                  </Card>
                ))}
              </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight="500" gutterBottom>
                CIB Breakdown
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Distribution of CIB by status based on file upload
              </Typography>
            </Box>

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
                  sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                  }}>
                  <Tab label="Summary" />
                  <Tab label="Active" />
                  <Tab label="Closed" />
                </Tabs>

                {activeTab === 0 && (
                  <TabCIBContract calculation={calculation} />
                )}

                {activeTab === 1 && (
                  <TabCIBActiveContract calculation={calculation} />
                )}

                {activeTab === 2 && (
                  <TabCIBClosedContract calculation={calculation} />
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
                  to="/cib-calculations"
                  variant="outlined"
                  sx={{ whiteSpace: "nowrap" }}>
                  Back
                </Button>
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
    </>
  );
};

export default PreviewCIBCalculation;
