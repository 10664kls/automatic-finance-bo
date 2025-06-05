"use client";

import React from "react";
import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  Button,
  Avatar,
  Tabs,
  Tab,
  alpha,
  Stack,
} from "@mui/material";
import { CalendarToday, FileDownload } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link as RouterLink } from "react-router-dom";

const generateRandomGrades = (): string[] =>
  Array.from({ length: 12 }, () => (Math.random() < 0.5 ? "A" : "B"));

interface LoanRow {
  id: number;
  bankName: string;
  firstInstalment: string;
  lastInstalment: string;
  interestRate: number;
  typeOfLoan: string;
  financeAmount: number;
  outstandingBalance: number;
  currency: string;
  overdueDate: number;
  gradeCIB: string;
  typeTermLoan: string;
  term: string;
  statusLoan: string;
  totalTermLoan: number;
  instalmentByCurrency: number;
  instalmentLAK: number;
  gradeCIBLast12Months: string[];
}

const sampleSummaryData: LoanRow[] = Array.from({ length: 10 }).map(
  (_, index) => ({
    id: index + 1,
    bankName: "KLS",
    firstInstalment: "21/11/2024",
    lastInstalment: "20/11/2030",
    interestRate: 16.4,
    typeOfLoan: "SE",
    financeAmount: 500_000_000 + index * 10_000_000,
    outstandingBalance: 50_000_000 - index * 5_000_000,
    currency: "LAK",
    overdueDate: 5 + index,
    gradeCIB: index % 2 === 0 ? "A" : "B",
    typeTermLoan: "OD",
    term: "MT",
    statusLoan: "Active",
    totalTermLoan: 24,
    instalmentByCurrency: 35_900_000,
    instalmentLAK: 35_900_000,
    gradeCIBLast12Months: generateRandomGrades(),
  })
);

const tableSummaryHeaders = [
  "No.",
  "Code Bank Name",
  "First Instalment Date",
  "Last Instalment Date",
  "Interest Rate",
  "Type of Loan",
  "Finance Amount",
  "Outstanding Balance",
  "Currency",
  "Overdue Date",
  "Grade CIB",
  "Type of Term Loan",
  "Term",
  "Status Loan",
  "Total Term Loan",
  "Instalment by Currency",
  "Instalment LAK",
  "Grade CIB Last 12 Months",
];

const tableActiveLoanHeaders = [
  "No.",
  "Code Bank Name",
  "Finance Amount",
  "Outstanding Balance",
  "Grade CIB",
  "Total Term Loan",
  "Instalment by Currency",
  "Instalment LAK",
  "Grade CIB Last 12 Months",
];

interface LoanActiveRow {
  id: number;
  bankName: string;
  financeAmount: number;
  outstandingBalance: number;
  gradeCIB: string;
  totalTermLoan: number;
  instalmentByCurrency: number;
  instalmentLAK: number;
  gradeCIBLast12Months: string[];
}

const sampleActiveData: LoanActiveRow[] = Array.from({ length: 7 }).map(
  (_, index) => ({
    id: index + 1,
    bankName: "KLS",
    financeAmount: 500_000_000 + index * 10_000_000,
    outstandingBalance: 50_000_000 - index * 5_000_000,
    gradeCIB: index % 2 === 0 ? "A" : "B",
    totalTermLoan: 24 * (index % 2),
    instalmentByCurrency: 35_900_000,
    instalmentLAK: 35_900_000,
    gradeCIBLast12Months: generateRandomGrades(),
  })
);

interface LoanCloseRow {
  id: number;
  bankName: string;
  financeAmount: number;
  gradeCIB: string;
  closedDate: string;
}

const sampleClosedData: LoanCloseRow[] = Array.from({ length: 3 }).map(
  (_, index) => ({
    id: index + 1,
    bankName: "KLS",
    financeAmount: 500_000_000 + index * 10_000_000,
    gradeCIB: index % 2 === 0 ? "A" : "B",
    closedDate: `2${index + 1}/0${index + 2}/2024`,
  })
);

const PreviewCIBCalculation: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  // Use primary color for all elements
  const primaryColor = theme.palette.primary.main;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    console.log(event);
    setActiveTab(newValue);
  };

  // Format currency with ₭ symbol and floor the number
  const formatCurrency = (amount: number) => {
    return `₭${Math.floor(amount).toLocaleString()}`;
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
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

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Data based on the CIB installment that was received on 28/04/2025
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
                alignItems: "flex-start",
                mb: 3,
              }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Loan
                </Typography>
                <Typography variant="h3" fontWeight="bold" sx={{ my: 1 }}>
                  {10}
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
                  {3}
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
                  {7}
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
                  {formatCurrency(
                    sampleSummaryData.reduce(
                      (sum, row) => sum + row.instalmentLAK,
                      0
                    )
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
                {getInitials("John Doe")}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="medium">
                  John Doe
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Facility/LO Number
              </Typography>
              <Typography variant="body1" fontWeight="medium" sx={{ mt: 1 }}>
                LO202305678
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
                  28/04/2025
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
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
            <Box sx={{ p: 3 }}>
              <TableContainer>
                <Table aria-label="fixed income salary table" size="small">
                  <TableHead>
                    <TableRow>
                      {tableSummaryHeaders.map((header, index) => (
                        <TableCell
                          key={index}
                          colSpan={
                            index === tableSummaryHeaders.length - 1 ? 12 : 1
                          }
                          sx={{
                            whiteSpace: "nowrap",
                            fontWeight: "bold",
                          }}>
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sampleSummaryData.map((row, index) => (
                      <React.Fragment key={row.id}>
                        <TableRow>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{row.bankName}</TableCell>
                          <TableCell>{row.firstInstalment}</TableCell>
                          <TableCell>{row.lastInstalment}</TableCell>
                          <TableCell align="right">
                            {row.interestRate}%
                          </TableCell>
                          <TableCell align="right">{row.typeOfLoan}</TableCell>
                          <TableCell align="right">
                            {row.financeAmount.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            {row.outstandingBalance.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">{row.currency}</TableCell>
                          <TableCell align="right">{row.overdueDate}</TableCell>
                          <TableCell>
                            <Typography
                              fontWeight="bold"
                              color={
                                row.gradeCIB === "A" || row.gradeCIB === "N"
                                  ? "primary"
                                  : "error"
                              }>
                              {row.gradeCIB}
                            </Typography>
                            {}
                          </TableCell>
                          <TableCell>{row.typeTermLoan}</TableCell>
                          <TableCell align="right">{row.term}</TableCell>
                          <TableCell>{row.statusLoan}</TableCell>
                          <TableCell align="right">
                            {row.totalTermLoan}
                          </TableCell>
                          <TableCell align="right">
                            {row.instalmentByCurrency.toLocaleString()}
                          </TableCell>
                          <TableCell align="center">
                            {row.instalmentLAK.toLocaleString()}
                          </TableCell>
                          {row.gradeCIBLast12Months.map((grade) => (
                            <TableCell>
                              <Typography
                                fontWeight="bold"
                                color={
                                  grade === "A" || grade === "N"
                                    ? "primary"
                                    : "error"
                                }>
                                {grade}
                              </Typography>
                            </TableCell>
                          ))}
                        </TableRow>
                      </React.Fragment>
                    ))}

                    <TableRow>
                      <TableCell align="right" colSpan={16}>
                        <Typography fontWeight="bold">
                          Total Instalment LAK
                        </Typography>
                      </TableCell>
                      <TableCell align="left" colSpan={13}>
                        <Typography fontWeight="bold">
                          {sampleSummaryData
                            .reduce((sum, row) => sum + row.instalmentLAK, 0)
                            .toLocaleString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              <TableContainer>
                <Table aria-label="allowance income table" size="small">
                  <TableHead>
                    <TableRow>
                      {tableActiveLoanHeaders.map((header, index) => (
                        <TableCell
                          key={index}
                          colSpan={
                            index === tableActiveLoanHeaders.length - 1 ? 12 : 1
                          }
                          sx={{
                            whiteSpace: "nowrap",
                            fontWeight: "bold",
                          }}>
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sampleActiveData.map((row, index) => (
                      <React.Fragment key={row.id}>
                        <TableRow>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{row.bankName}</TableCell>
                          <TableCell>
                            {row.financeAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {row.outstandingBalance.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              fontWeight="bold"
                              color={
                                row.gradeCIB === "A" || row.gradeCIB === "N"
                                  ? "primary"
                                  : "error"
                              }>
                              {row.gradeCIB}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {row.totalTermLoan}
                          </TableCell>
                          <TableCell align="right">
                            {row.instalmentByCurrency.toLocaleString()}
                          </TableCell>
                          <TableCell align="center">
                            {row.instalmentLAK.toLocaleString()}
                          </TableCell>
                          {row.gradeCIBLast12Months.map((grade) => (
                            <TableCell>
                              <Typography
                                fontWeight="bold"
                                color={
                                  grade === "A" || grade === "N"
                                    ? "primary"
                                    : "error"
                                }>
                                {grade}
                              </Typography>
                            </TableCell>
                          ))}
                        </TableRow>
                      </React.Fragment>
                    ))}
                    <TableRow>
                      <TableCell align="right" colSpan={7}>
                        <Typography fontWeight="bold">
                          Total Instalment LAK
                        </Typography>
                      </TableCell>
                      <TableCell colSpan={13} align="left">
                        <Typography fontWeight="bold">
                          {sampleActiveData
                            .reduce((sum, row) => sum + row.instalmentLAK, 0)
                            .toLocaleString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {activeTab === 2 && (
            <Box sx={{ p: 3 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          fontWeight: "bold",
                        }}>
                        No.
                      </TableCell>
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          fontWeight: "bold",
                        }}>
                        Code Bank Name
                      </TableCell>
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          fontWeight: "bold",
                        }}>
                        Finance Amount
                      </TableCell>
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          fontWeight: "bold",
                        }}>
                        Grade CIB
                      </TableCell>
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          fontWeight: "bold",
                        }}>
                        Closed Date
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sampleClosedData.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{row.bankName}</TableCell>
                        <TableCell>
                          {row.financeAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Typography
                            fontWeight="bold"
                            color={
                              row.gradeCIB === "A" || row.gradeCIB === "N"
                                ? "primary"
                                : "error"
                            }>
                            {row.gradeCIB}
                          </Typography>
                        </TableCell>
                        <TableCell>{row.closedDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
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
    </Box>
  );
};

export default PreviewCIBCalculation;
