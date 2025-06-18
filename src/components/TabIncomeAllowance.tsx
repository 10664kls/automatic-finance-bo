import {
  Alert,
  Box,
  Button,
  Chip,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Allowance, Calculation, IncomeTransaction } from "../api/model";
import { Edit, MonetizationOn } from "@mui/icons-material";
import { formatCurrency, sumFromIncomeTransactions } from "../utils/format";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../api/axios";
import DialogAllowanceTransaction from "./DialogAllowanceTransaction";
import { AxiosError } from "axios";

interface TabIncomeAllowanceProps {
  calculation: Calculation;
}

const TabIncomeAllowance = (req: TabIncomeAllowanceProps) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editAllowances, setEditAllowances] = useState<Allowance[]>([]);
  const queryClient = useQueryClient();

  const recalculateMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await API.put<{ calculation: Calculation }>(
          `/v1/incomes/calculations/${req.calculation.number}`,
          {
            basicSalaryFromInterview: req.calculation.basicSalaryFromInterview,
            monthlySalaries: req.calculation.salaryBreakdown.monthlySalaries,
            allowances: editAllowances,
            commissions: req.calculation.commissionBreakdown.commissions,
          }
        );
        if (response.status !== 200) {
          throw Error("Failed to recalculate income");
        }
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          if (
            error.response?.status === 400 &&
            error.response.data?.error?.status === "FAILED_PRECONDITION"
          ) {
            setSubmitError(error.response.data.error.message);
            throw new Error(error.response.data.error.message);
          }
        }

        setSubmitError("Failed to recalculate income. Please try again later.");
        throw error;
      }
    },
    mutationKey: ["recalculate"],
    onSuccess: () => {
      setShowSnackbar(true);
      setSubmitSuccess(true);
      setSubmitError(null);
      setOpenDialog(false);
      queryClient.invalidateQueries({
        queryKey: ["getCalculation"],
      });
    },
    onError: () => {
      setShowSnackbar(true);
      setSubmitSuccess(false);
    },
  });

  const saveChanges = async () => {
    recalculateMutation.mutate();
  };

  const removeTransaction = (title: string, billNumber: string) => {
    const updated = editAllowances.reduce<Allowance[]>((acc, item) => {
      if (item.title !== title) {
        acc.push(item);
        return acc;
      }

      const filtered = item.transactions.filter(
        (t) => t.billNumber !== billNumber
      );

      // If no transactions left, remove the whole item
      if (filtered.length === 0) {
        return acc;
      }

      const total = sumFromIncomeTransactions(filtered);
      const monthlyAverage = Math.floor(Number(total) / item.months);

      acc.push({
        ...item,
        transactions: filtered,
        total,
        monthlyAverage: monthlyAverage < 0 ? 0 : monthlyAverage,
      });

      return acc;
    }, []);

    setEditAllowances(updated);
  };

  const updateTransaction = (title: string, average: number) => {
    const updated = editAllowances.map((item) => {
      if (item.title !== title) return item;

      const total = sumFromIncomeTransactions(item.transactions);
      const monthlyAverage = Math.floor(Number(total) / Number(average));
      return {
        ...item,
        monthlyAverage: monthlyAverage < 0 ? 0 : monthlyAverage,
        months: average,
        total: total,
      };
    });
    setEditAllowances(updated);
  };

  const addTransaction = (transaction: IncomeTransaction) => {
    setEditAllowances((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.title === transaction.noted
      );

      // Case 1: Update existing item
      if (existingIndex !== -1) {
        const updated = [...prev];
        const existingItem = updated[existingIndex];
        const updatedTransactions = [...existingItem.transactions, transaction];

        const total = sumFromIncomeTransactions(updatedTransactions);
        const monthlyAverage = Math.floor(total / existingItem.months);

        updated[existingIndex] = {
          ...existingItem,
          transactions: updatedTransactions,
          total,
          monthlyAverage: monthlyAverage < 0 ? 0 : monthlyAverage,
        };

        return updated;
      }

      // Case 2: Add new item
      const newItem = {
        title: transaction.noted,
        months: 12,
        transactions: [transaction],
        total: transaction.amount,
        monthlyAverage: Math.floor(transaction.amount / 12),
      };

      return [...prev, newItem];
    });
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}>
          <Typography variant="h6" fontWeight="medium">
            Breakdown of allowances
          </Typography>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {req.calculation.status === "PENDING" && (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => {
                  setOpenDialog(true);
                  setEditAllowances(
                    req.calculation.allowanceBreakdown.allowances
                  );
                }}
                size="small"
                sx={{ textTransform: "none" }}>
                Edit
              </Button>
            )}

            <Chip
              icon={<MonetizationOn />}
              label={`Total: ${formatCurrency(
                req.calculation.allowanceBreakdown.total,
                req.calculation.account.currency
              )}`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: "medium" }}
            />
          </Box>
        </Box>

        <TableContainer>
          <Table aria-label="allowance income table" size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography fontWeight="bold">Noted</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold">Total Allowance</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold">Average</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold">Average/Month</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {req.calculation.allowanceBreakdown.allowances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography align="center">No data found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                req.calculation.allowanceBreakdown.allowances.map(
                  (row, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        {row.title}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(
                          row.total,
                          req.calculation.account.currency
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {row.months.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(
                          row.monthlyAverage,
                          req.calculation.account.currency
                        )}
                      </TableCell>
                    </TableRow>
                  )
                )
              )}
              <TableRow>
                <TableCell colSpan={3}>
                  <Typography fontWeight="bold">Total</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold">
                    {formatCurrency(
                      req.calculation.allowanceBreakdown.total,
                      req.calculation.account.currency
                    )}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {openDialog && (
        <DialogAllowanceTransaction
          open={openDialog}
          calculationNumber={req.calculation.number}
          currency={req.calculation.account.currency}
          allowances={editAllowances}
          category="Allowance"
          transactions={editAllowances.map((t) => {
            return {
              title: t.title,
              months: t.months,
              transactions: t.transactions,
            };
          })}
          onClose={() => setOpenDialog(false)}
          saveChanges={saveChanges}
          addTransaction={addTransaction}
          updateTransaction={updateTransaction}
          removeTransaction={removeTransaction}
        />
      )}

      {submitSuccess && showSnackbar && (
        <Snackbar
          open={showSnackbar}
          autoHideDuration={3000}
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert
            onClose={() => setShowSnackbar(false)}
            severity="success"
            sx={{ width: "100%" }}>
            Income recalculated successfully!
          </Alert>
        </Snackbar>
      )}

      {submitError && showSnackbar && (
        <Snackbar
          open={showSnackbar}
          autoHideDuration={3000}
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert
            onClose={() => setShowSnackbar(false)}
            severity="error"
            sx={{ width: "100%" }}>
            {submitError}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

export default TabIncomeAllowance;
