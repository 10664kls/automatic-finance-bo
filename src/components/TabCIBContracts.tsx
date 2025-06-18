import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { CIBCalculation } from "../api/model";
import { formatCurrency, formatWithoutCurrency } from "../utils/format";
import React from "react";

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

interface TabCIBContractsProps {
  calculation: CIBCalculation;
}

const TabCIBContract = (req: TabCIBContractsProps) => {
  return (
    <Box sx={{ p: 3 }}>
      <TableContainer>
        <Table aria-label="fixed income salary table" size="small">
          <TableHead>
            <TableRow>
              {tableSummaryHeaders.map((header, index) => (
                <TableCell
                  key={index}
                  colSpan={index === tableSummaryHeaders.length - 1 ? 12 : 1}
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
            {req.calculation.contracts.length === 0 && (
              <TableRow>
                <TableCell align="center" colSpan={tableSummaryHeaders.length}>
                  No data fond
                </TableCell>
              </TableRow>
            )}
            {req.calculation.contracts.map((row, index) => (
              <React.Fragment key={row.number}>
                <TableRow>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.bankCode}</TableCell>
                  <TableCell>
                    {new Date(row.firstInstallment).toLocaleDateString("lo-LA")}
                  </TableCell>
                  <TableCell>
                    {new Date(row.lastInstallment).toLocaleDateString("lo-LA")}
                  </TableCell>
                  <TableCell align="right">
                    {formatWithoutCurrency(row.interestRate)}%
                  </TableCell>
                  <TableCell align="right">{row.type}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(row.financeAmount, row.currency)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(row.outstandingBalance, row.currency)}
                  </TableCell>
                  <TableCell align="right">{row.currency}</TableCell>
                  <TableCell align="right">
                    {formatWithoutCurrency(row.overdueInDay)}
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
                    {}
                  </TableCell>
                  <TableCell>{row.termType}</TableCell>
                  <TableCell align="right">{row.term}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell align="right">{row.period}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(row.installment, row.currency)}
                  </TableCell>
                  <TableCell align="center">
                    {formatCurrency(row.installmentInLAK)}
                  </TableCell>
                  {row.gradeCIBLast12months.length === 0 && (
                    <TableCell colSpan={12}></TableCell>
                  )}
                  {row.gradeCIBLast12months.map((grade, idx) => (
                    <React.Fragment key={`grade-${idx}-${grade}`}>
                      <TableCell>
                        <Typography
                          fontWeight="bold"
                          color={
                            grade === "A" || grade === "N" ? "primary" : "error"
                          }>
                          {grade}
                        </Typography>
                      </TableCell>
                    </React.Fragment>
                  ))}
                </TableRow>
              </React.Fragment>
            ))}

            <TableRow>
              <TableCell align="right" colSpan={16}>
                <Typography fontWeight="bold">Total Instalment LAK</Typography>
              </TableCell>
              <TableCell align="left" colSpan={13}>
                <Typography fontWeight="bold">
                  {formatCurrency(req.calculation.totalInstallmentInLAK)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TabCIBContract;
