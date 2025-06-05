import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import { IncomeTransaction } from "../api/model";
import { Add, Cancel, Delete, DriveFileMove, Save } from "@mui/icons-material";
import { formatCurrency } from "../utils/format";
import { useState } from "react";
import API from "../api/axios";

interface TransactionBreakdown {
  title: string;
  transactions: IncomeTransaction[];
}

interface DialogProps {
  open: boolean;
  currency: string;
  category: string;
  calculationNumber: string;
  transactions: TransactionBreakdown[];
  addTransaction: (transaction: IncomeTransaction) => void;
  removeTransaction: (title: string, billNumber: string) => void;
  moveTransaction?: (title: string, transaction: IncomeTransaction) => void; // Optional if you want to implement moving transactions
  saveChanges: () => void;
  onClose: () => void;
}

const DialogIncomeTransaction = ({
  open,
  onClose,
  calculationNumber,
  currency,
  transactions,
  addTransaction,
  removeTransaction,
  saveChanges,
  category,
  moveTransaction,
}: DialogProps) => {
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [billNumber, setBillNumber] = useState<string>("");

  const getTransactionByBillNumber =
    async (): Promise<IncomeTransaction | null> => {
      try {
        const response = await API.get<{ transaction: IncomeTransaction }>(
          `/v1/incomes/calculations/${calculationNumber}/transactions/${billNumber}`
        );

        return response.data.transaction;
      } catch {
        return null;
      }
    };

  const handleAddTransaction = async () => {
    if (!billNumber) {
      setSubmitError("Please fill in bill number field");
      setShowSnackbar(true);
      return;
    }

    const s = await getTransactionByBillNumber();
    if (!s) {
      setSubmitError("Your provided bill number does not exist");
      setShowSnackbar(true);
      return;
    }

    addTransaction(s);
    setShowSnackbar(true);
    setSuccess(true);
    setSuccessMessage("Transaction added successfully");
    setBillNumber("");
    return;
  };

  let index = 1;
  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
        <DialogTitle>{category} Transactions Preview</DialogTitle>
        <DialogContent dividers sx={{ minHeight: "345px", maxHeight: "499px" }}>
          {transactions && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>No.</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Bill Number
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }} align="center">
                      Noted
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )}
                  {transactions.map((tx) => {
                    if (!tx.transactions) return null;

                    return tx.transactions.map((t) => (
                      <TableRow key={`${t.billNumber}-${index}`}>
                        <TableCell width={20}>{index++}</TableCell>
                        <TableCell width={120}>{t.date}</TableCell>
                        <TableCell width={150}>{t.billNumber}</TableCell>
                        <TableCell align="left" sx={{ maxWidth: 350 }}>
                          {t.noted}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(t.amount, currency)}
                        </TableCell>
                        <TableCell>
                          {category.toUpperCase() === "SALARY" && (
                            <Tooltip title="Move to Commission/OT">
                              <IconButton
                                onClick={() => {
                                  if (moveTransaction) {
                                    moveTransaction(tx.title, t);
                                    setShowSnackbar(true);
                                    setSuccess(true);
                                    setSuccessMessage(
                                      "Transaction moved successfully"
                                    );
                                  }
                                }}
                                size="small"
                                color="primary">
                                <DriveFileMove />
                              </IconButton>
                            </Tooltip>
                          )}

                          <Tooltip title="Remove">
                            <IconButton
                              onClick={() => {
                                removeTransaction(tx.title, t.billNumber);
                              }}
                              size="small"
                              color="primary">
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ));
                  })}
                </TableBody>
              </Table>
              <Box sx={{ mt: 2, px: 4 }}>
                <Stack spacing={2} direction="row">
                  <TextField
                    size="small"
                    label="Bill Number"
                    variant="outlined"
                    fullWidth
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                  />

                  <Button
                    startIcon={<Add />}
                    variant="outlined"
                    size="small"
                    onClick={handleAddTransaction}
                    sx={{ textTransform: "none", minWidth: 180 }}>
                    Add New Transaction
                  </Button>
                </Stack>
              </Box>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions sx={{ mb: 2, mr: 2, mt: 1 }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={saveChanges}
            size="medium"
            sx={{ textTransform: "none" }}>
            Save changes
          </Button>
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={onClose}
            size="medium"
            sx={{ textTransform: "none" }}>
            Discard
          </Button>
        </DialogActions>
      </Dialog>

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

      {success && successMessage && showSnackbar && (
        <Snackbar
          open={showSnackbar}
          autoHideDuration={3000}
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert
            onClose={() => setShowSnackbar(false)}
            severity="success"
            sx={{ width: "100%" }}>
            {successMessage}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

export default DialogIncomeTransaction;
