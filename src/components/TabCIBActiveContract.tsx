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
import React from "react";
import { CIBCalculation } from "../api/model";
import { formatCurrency, formatWithoutCurrency } from "../utils/format";

interface TabCIBContractsProps {
  calculation: CIBCalculation;
}

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

const TabCIBActiveContract = (req: TabCIBContractsProps) => {
  return (
    <Box sx={{ p: 3 }}>
      <TableContainer>
        <Table aria-label="allowance income table" size="small">
          <TableHead>
            <TableRow>
              {tableActiveLoanHeaders.map((header, index) => (
                <TableCell
                  key={index}
                  colSpan={index === tableActiveLoanHeaders.length - 1 ? 12 : 1}
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
                <TableCell
                  align="center"
                  colSpan={tableActiveLoanHeaders.length}>
                  No data found
                </TableCell>
              </TableRow>
            )}
            {req.calculation.contracts
              .filter((contract) => contract.status === "ACTIVE")
              .map((row, index) => (
                <React.Fragment key={row.number}>
                  <TableRow>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.bankCode}</TableCell>
                    <TableCell>
                      {formatCurrency(row.financeAmount, row.currency)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(row.outstandingBalance, row.currency)}
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
                      {formatWithoutCurrency(row.period)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(row.installment, row.currency)}
                    </TableCell>
                    <TableCell align="center">
                      {formatCurrency(row.installmentInLAK)}
                    </TableCell>
                    {row.gradeCIBLast12months.map((grade, idx) => (
                      <React.Fragment key={`grade-${idx}-${grade}`}>
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
                      </React.Fragment>
                    ))}
                  </TableRow>
                </React.Fragment>
              ))}
            <TableRow>
              <TableCell align="right" colSpan={7}>
                <Typography fontWeight="bold">Total Instalment LAK</Typography>
              </TableCell>
              <TableCell colSpan={13} align="left">
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

export default TabCIBActiveContract;
