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
import {
  Allowance,
  Calculation,
  Commission,
  IncomeTransaction,
  MonthlySalary,
} from "../api/model";
import { Edit, Payments } from "@mui/icons-material";
import { formatCurrency, sumFromIncomeTransactions } from "../utils/format";
import DialogIncomeTransaction from "./DialogIncomeTransaction";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../api/axios";
import { DateTime } from "luxon";
import { AxiosError } from "axios";

interface TabIncomeSalaryProps {
  calculation: Calculation;
}

const TabIncomeSalary = (req: TabIncomeSalaryProps) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [editSalaries, setEditSalaries] = useState<MonthlySalary[]>([]);
  const [editCommissions, setEditCommissions] = useState<Commission[]>([]);
  const [editAllowances, setEditAllowances] = useState<Allowance[]>([]);
  const queryClient = useQueryClient();

  const recalculateMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await API.put<{ calculation: Calculation }>(
          `/v1/incomes/calculations/${req.calculation.number}`,
          {
            basicSalaryFromInterview: req.calculation.basicSalaryFromInterview,
            monthlySalaries: editSalaries,
            allowances: editAllowances,
            commissions: editCommissions,
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
        queryKey: ["getIncomeCalculation"],
      });
    },
    onError: () => {
      setShowSnackbar(true);
      setSubmitSuccess(false);
    },
  });

  const removeTransactionByIndex = (month: string, billNumber: string) => {
    const updated = editSalaries.map((salary) => {
      if (salary.month !== month) return salary;

      const filtered = salary.transactions.filter(
        (t) => t.billNumber !== billNumber
      );

      return {
        ...salary,
        transactions: filtered,
        timesReceived: filtered.length,
        total: sumFromIncomeTransactions(filtered),
      };
    });

    setEditSalaries(updated);
  };

  const saveChanges = async () => {
    recalculateMutation.mutate();
  };

  const addTransaction = (transaction: IncomeTransaction) => {
    setEditSalaries((prev) => {
      const month = DateTime.fromFormat(
        transaction.date,
        "dd-MM-yyyy"
      ).toFormat("LLLL-yyyy");
      const existingIndex = prev.findIndex((item) => item.month === month);

      // Case 1: Update existing item
      if (existingIndex !== -1) {
        const updated = [...prev];
        const existingItem = updated[existingIndex];
        const updatedTransactions = [...existingItem.transactions, transaction];

        const total = sumFromIncomeTransactions(updatedTransactions);
        updated[existingIndex] = {
          ...existingItem,
          transactions: updatedTransactions,
          total,
          timesReceived: updatedTransactions.length,
        };

        return updated;
      }

      // Case 2: Add new item
      const newItem = {
        month,
        transactions: [transaction],
        total: transaction.amount,
        timesReceived: 1,
      };

      return [...prev, newItem];
    });
  };

  const moveTransactionToCommission = (
    month: string,
    transaction: IncomeTransaction
  ) => {
    removeTransactionByIndex(month, transaction.billNumber);
    setEditCommissions((prev) => {
      const month = DateTime.fromFormat(
        transaction.date,
        "dd-MM-yyyy"
      ).toFormat("LLLL-yyyy");
      const existingIndex = prev.findIndex((item) => item.month === month);

      // Case 1: Update existing item
      if (existingIndex !== -1) {
        const updated = [...prev];
        const existingItem = updated[existingIndex];
        const updatedTransactions = [...existingItem.transactions, transaction];

        const total = sumFromIncomeTransactions(updatedTransactions);
        updated[existingIndex] = {
          ...existingItem,
          transactions: updatedTransactions,
          total,
        };

        return updated;
      }

      // Case 2: Add new item
      const newItem = {
        month,
        transactions: [transaction],
        total: transaction.amount,
      };

      return [...prev, newItem];
    });
  };

  const adjustTransaction = (
    category: string,
    amount: number,
    transaction: IncomeTransaction,
    average?: number
  ) => {
    const remainingAmount = transaction.amount - amount;
    setEditSalaries((prev) => {
      const month = DateTime.fromFormat(
        transaction.date,
        "dd-MM-yyyy"
      ).toFormat("LLLL-yyyy");
      const existingIndex = prev.findIndex((item) => item.month === month);
      if (existingIndex !== -1) {
        const updatedMonthlySalaries = [...prev];
        const existingItem = updatedMonthlySalaries[existingIndex];
        const updatedExistingItem = { ...existingItem };
        const txIDx = updatedExistingItem.transactions.findIndex(
          (t) => t.billNumber === transaction.billNumber
        );

        if (txIDx !== -1) {
          const updatedTransactions = [...updatedExistingItem.transactions];
          const updatedTransaction = { ...updatedTransactions[txIDx] };
          updatedTransaction.amount = remainingAmount;
          updatedTransactions[txIDx] = updatedTransaction;

          const total = sumFromIncomeTransactions(updatedTransactions);
          updatedExistingItem.transactions = updatedTransactions;
          updatedExistingItem.total = total;
          updatedExistingItem.timesReceived = updatedTransactions.length;
          updatedMonthlySalaries[existingIndex] = updatedExistingItem;
        }
        return updatedMonthlySalaries;
      }

      return prev;
    });

    switch (category) {
      case "ALLOWANCE":
        setEditAllowances((prev) => {
          const existingIndex = prev.findIndex(
            (item) => item.title === transaction.noted
          );

          // Case 1: Update existing item
          if (existingIndex !== -1) {
            const updated = [...prev];
            const existingItem = updated[existingIndex];
            const updatedTransactions = [
              ...existingItem.transactions,
              transaction,
            ];

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
            months: average ?? 12,
            transactions: [{ ...transaction, amount: amount }],
            total: amount,
            monthlyAverage: Math.floor(amount / (average ?? 12)),
          };

          return [...prev, newItem];
        });
        break;

      case "COMMISSION":
        setEditCommissions((prev) => {
          const month = DateTime.fromFormat(
            transaction.date,
            "dd-MM-yyyy"
          ).toFormat("LLLL-yyyy");
          const existingIndex = prev.findIndex((item) => item.month === month);

          // Case 1: Update existing item
          if (existingIndex !== -1) {
            const updated = [...prev];
            const existingItem = updated[existingIndex];
            const updatedTransactions = [
              ...existingItem.transactions,
              { ...transaction, amount: amount },
            ];

            const total = sumFromIncomeTransactions(updatedTransactions);
            updated[existingIndex] = {
              ...existingItem,
              transactions: updatedTransactions,
              total,
            };

            return updated;
          }

          // Case 2: Add new item
          const newItem = {
            month,
            transactions: [{ ...transaction, amount: amount }],
            total: amount,
          };

          return [...prev, newItem];
        });
        break;
    }
  };

  const handleClosedDialog = () => {
    setOpenDialog(false);
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
            Monthly breakdown of base salary with payment details
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {req.calculation.status === "PENDING" && (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => {
                  setOpenDialog(true);
                  setEditSalaries(
                    Array.from(req.calculation.salaryBreakdown.monthlySalaries)
                  );
                  setEditCommissions([
                    ...req.calculation.commissionBreakdown.commissions,
                  ]);
                  setEditAllowances([
                    ...req.calculation.allowanceBreakdown.allowances,
                  ]);
                }}
                size="small"
                sx={{ textTransform: "none" }}>
                Edit
              </Button>
            )}

            <Chip
              icon={<Payments />}
              label={`Total: ${formatCurrency(
                req.calculation.salaryBreakdown.total,
                req.calculation.account.currency
              )}`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: "medium" }}
            />
          </Box>
        </Box>

        <TableContainer>
          <Table aria-label="fixed income salary table" size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography fontWeight="bold">Month</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold">Times Received</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold">
                    Actual Amounts Received
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold">Total</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {req.calculation.salaryBreakdown.monthlySalaries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography align="center">No data found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                req.calculation.salaryBreakdown.monthlySalaries.map(
                  (row, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        {row.month}
                      </TableCell>
                      <TableCell align="right">{row.timesReceived}</TableCell>
                      <TableCell align="right">
                        {row.transactions &&
                          row.transactions.map((tx, i) => (
                            <Chip
                              key={i}
                              label={formatCurrency(
                                tx.amount,
                                req.calculation.account.currency
                              )}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(
                          row.total,
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
                      req.calculation.salaryBreakdown.total,
                      req.calculation.account.currency
                    )}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {openDialog && req.calculation.status === "PENDING" && (
        <DialogIncomeTransaction
          open={openDialog}
          category="Salary"
          calculationNumber={req.calculation.number}
          currency={req.calculation.account.currency}
          transactions={editSalaries.map((t) => {
            return {
              title: t.month,
              transactions: t.transactions,
            };
          })}
          onClose={handleClosedDialog}
          saveChanges={saveChanges}
          addTransaction={addTransaction}
          removeTransaction={removeTransactionByIndex}
          moveTransaction={moveTransactionToCommission}
          adjustTransaction={adjustTransaction}
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

export default TabIncomeSalary;
