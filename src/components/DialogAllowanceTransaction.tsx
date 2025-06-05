import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Allowance, IncomeTransaction } from "../api/model";
import { Add, Cancel, Delete, Save } from "@mui/icons-material";
import { formatCurrency } from "../utils/format";
import { useState } from "react";
import API from "../api/axios";

interface TransactionBreakdown {
  title: string;
  months: number;
  transactions: IncomeTransaction[];
}

interface DialogProps {
  open: boolean;
  calculationNumber: string;
  currency: string;
  category: string;
  allowances: Allowance[];
  transactions: TransactionBreakdown[];
  addTransaction: (title: string, transaction: IncomeTransaction) => void;
  updateTransaction: (title: string, months: number) => void;
  removeTransaction: (title: string, billNumber: string) => void;
  saveChanges: () => void;
  onClose: () => void;
}

const DialogAllowanceTransaction = ({
  open,
  onClose,
  currency,
  calculationNumber,
  transactions,
  allowances,
  addTransaction,
  updateTransaction,
  removeTransaction,
  saveChanges,
  category,
}: DialogProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [billNumber, setBillNumber] = useState<string>("");
  const [title, setTitle] = useState<string>("");

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

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAddTransaction = async () => {
    if (!title || !billNumber) {
      setSubmitError("Please fill in all fields");
      setShowSnackbar(true);
      return;
    }

    const s = await getTransactionByBillNumber();
    if (!s) {
      setSubmitError("Failed to fetch transaction by bill number");
      setShowSnackbar(true);
      return;
    }

    addTransaction(title, s);
    setShowSnackbar(true);
    setSuccess(true);
    setSuccessMessage("Transaction added successfully");
    setTitle("");
    setBillNumber("");
    return;
  };

  let index = 1;

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
        <DialogTitle>{category} Transactions Preview</DialogTitle>
        <DialogContent dividers sx={{ minHeight: "345px", maxHeight: "499px" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            aria-label="basic tabs example"
            sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tab label="Breakdown" />
            <Tab label="Transactions" />
          </Tabs>

          {activeTab === 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                mt: 2,
              }}>
              <TableContainer>
                <Table aria-label="allowance income table" size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight="bold">
                          Type of Income
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">
                          Total Allowance
                        </Typography>
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
                    {allowances.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography align="center">No data found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      allowances.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell component="th" scope="row">
                            {row.title}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(row.total, currency)}
                          </TableCell>
                          <TableCell align="right">
                            <FormControl variant="outlined">
                              <Select
                                size="small"
                                sx={{ minWidth: 80 }}
                                value={row.months}
                                onChange={(e) => {
                                  updateTransaction(
                                    row.title,
                                    Number(e.target.value)
                                  );
                                }}>
                                <MenuItem value={12}>12</MenuItem>
                                <MenuItem value={6}>6</MenuItem>
                                <MenuItem value={3}>3</MenuItem>
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(row.monthlyAverage, currency)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {activeTab === 1 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                mt: 2,
              }}>
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
                        <TableCell sx={{ fontWeight: "bold" }} align="center">
                          Amount
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Actions
                        </TableCell>
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
                            <TableCell sx={{ minWidth: 80, maxWidth: 80 }}>
                              {t.date}
                            </TableCell>
                            <TableCell sx={{ maxWidth: 115 }}>
                              {t.billNumber}
                            </TableCell>
                            <TableCell align="left" sx={{ maxWidth: 350 }}>
                              {t.noted}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(t.amount, currency)}
                            </TableCell>
                            <TableCell>
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
                        label="Type of Income"
                        variant="outlined"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                      />

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
            </Box>
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

export default DialogAllowanceTransaction;
