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
import { formatCurrency } from "../utils/format";

interface TabCIBContractsProps {
  calculation: CIBCalculation;
}

const TabCIBClosedContract = (req: TabCIBContractsProps) => {
  return (
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
            {req.calculation.contracts.length === 0 && (
              <TableRow>
                <TableCell align="center" colSpan={5}>
                  No data found
                </TableCell>
              </TableRow>
            )}

            {req.calculation.contracts
              .filter((contract) => contract.status === "CLOSED")
              .map((row, index) => (
                <TableRow key={row.number}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.bankCode}</TableCell>
                  <TableCell>
                    {formatCurrency(row.financeAmount, row.currency)}
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
                  <TableCell>
                    {new Date(row.lastInstallment).toLocaleDateString("lo-LA")}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TabCIBClosedContract;
