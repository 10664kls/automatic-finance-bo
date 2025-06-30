import { Cancel } from "@mui/icons-material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { IncomeTransaction } from "../api/model";
import { formatCurrency } from "../utils/format";
import FormattedNumberInput from "./FormattedNumberInput";
import { useState } from "react";
import { cleanNumberForAPI } from "../utils/number";

interface TransactionAdjustmentProps {
  open: boolean;
  currency: string;
  transaction: IncomeTransaction;
  onClose: () => void;
  adjust: (
    category: string,
    amount: number,
    transaction: IncomeTransaction,
    average?: number
  ) => void;
}

const DialogIncomeTransactionAdjustment = ({
  open,
  onClose,
  currency,
  transaction,
  adjust,
}: TransactionAdjustmentProps) => {
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [average, setAverage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [averageError, setAverageError] = useState<string | null>(null);

  const handleAmountChange = (formattedValue: string, val: number) => {
    setAmount(formattedValue);
    const numericValue = cleanNumberForAPI(val);

    // Validation logic
    if (numericValue > transaction.amount) {
      setError(
        `Amount cannot exceed ${formatCurrency(transaction.amount, currency)}`
      );
    } else if (numericValue <= 0 && formattedValue !== "") {
      setError("Amount must be greater than 0");
    } else {
      setError(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      ".",
    ];

    if (e.ctrlKey && ["a", "c", "v", "x", "z"].includes(e.key.toLowerCase())) {
      return;
    }

    if (allowedKeys.includes(e.key)) {
      return;
    }

    if (e.key >= "0" && e.key <= "9") {
      return;
    }

    e.preventDefault();
  };

  const handleAdjust = () => {
    if (!amount) {
      setError("Amount is required");
    }
    if (!category) {
      setCategoryError("Category is required");
    }
    if (!average && category === "ALLOWANCE") {
      setAverageError("Average is required");
    }
    if (cleanNumberForAPI(amount) > transaction.amount) {
      setError(
        `Amount cannot exceed ${formatCurrency(transaction.amount, currency)}`
      );
    }

    if (error || categoryError || averageError) return;

    if (category && amount && category) {
      adjust(category, cleanNumberForAPI(amount), transaction, Number(average));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        Adjust Transaction
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            p: 2,
            bgcolor: "info.50",
            borderRadius: 1,
            border: "0.5px solid",
            borderColor: "info.200",
          }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Transaction Information
          </Typography>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Note:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {transaction.noted}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Bill Number:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {transaction.billNumber}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Date:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {transaction.date}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Amount:
              </Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {formatCurrency(transaction.amount, currency)}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack sx={{ mt: 2 }} spacing={2} direction="column">
          <FormControl
            size="small"
            fullWidth
            sx={{
              flex: 1,
              minWidth: "150px",
              "& .MuiOutlinedInput-root": {
                fontSize: "1rem",
                fontWeight: "medium",
              },
            }}
            error={!!categoryError}>
            <InputLabel>Adjust to Category</InputLabel>
            <Select
              value={category}
              label="Adjust to Category"
              onChange={(e) => {
                setCategory(e.target.value);
                setCategoryError(null);
              }}>
              <MenuItem key="Allowance-Key" value="ALLOWANCE">
                Allowance
              </MenuItem>
              <MenuItem key="Commission-Key" value="COMMISSION">
                Commission/OT
              </MenuItem>
            </Select>
            {categoryError && <FormHelperText>{categoryError}</FormHelperText>}
          </FormControl>

          {category === "ALLOWANCE" && (
            <FormControl
              size="small"
              fullWidth
              sx={{
                flex: 1,
                minWidth: "150px",
                "& .MuiOutlinedInput-root": {
                  fontSize: "1rem",
                  fontWeight: "medium",
                },
              }}
              error={!!averageError}>
              <InputLabel>Average</InputLabel>
              <Select
                size="small"
                label="Average"
                value={average}
                onChange={(e) => {
                  setAverage(e.target.value);
                  setAverageError(null);
                }}>
                <MenuItem value={12}>12</MenuItem>
                <MenuItem value={6}>6</MenuItem>
                <MenuItem value={3}>3</MenuItem>
              </Select>
              {averageError && <FormHelperText>{averageError}</FormHelperText>}
            </FormControl>
          )}

          <FormattedNumberInput
            type="text"
            size="small"
            label="Amount"
            value={amount}
            sx={{
              flex: 1,
              minWidth: "150px",
              "& .MuiOutlinedInput-root": {
                fontSize: "1rem",
                fontWeight: "medium",
              },
            }}
            onChange={handleAmountChange}
            onKeyDown={handleKeyDown}
            error={!!error}
            helperText={error}
          />
        </Stack>
        <Typography
          variant="body2"
          sx={{ mt: 1, fontSize: "0.9rem", textAlign: "end" }}>
          Remaining:{" "}
          {error
            ? formatCurrency(transaction.amount, currency)
            : formatCurrency(
                transaction.amount - cleanNumberForAPI(amount),
                currency
              )}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ mb: 2, mr: 2, mt: 1 }}>
        <Button
          variant="contained"
          startIcon={<AutoFixHighIcon />}
          onClick={handleAdjust}
          size="medium"
          sx={{ textTransform: "none" }}>
          Adjust Transaction
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
  );
};

export default DialogIncomeTransactionAdjustment;
