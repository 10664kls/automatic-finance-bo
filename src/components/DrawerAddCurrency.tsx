import {
  Alert,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import CloseIcon from "@mui/icons-material/Close";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: { code: string; exchangeRate: number }) => Promise<void>;
}

const ISO4217_REGEX = /^[A-Z]{3}$/;

const DrawerAddCurrency = (req: DrawerProps) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: req.onSubmit,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listCurrencies"],
      });
      req.onClose();
    },
    onError: () => {
      setError("Failed to create currency");
    },
  });

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      code: "",
      exchangeRate: 0,
    },
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  useEffect(() => {
    if (req.open) {
      reset({
        code: "",
        exchangeRate: 0,
      });
    }
  }, [req.open, reset]);

  const handleOnSubmit = (data: { code: string; exchangeRate: number }) => {
    setLoading(true);

    mutation.mutate({
      code: data.code,
      exchangeRate: data.exchangeRate,
    });
    setLoading(false);
  };

  const handleClose = () => {
    req.onClose();
  };
  return (
    <>
      <Drawer
        anchor="right"
        open={req.open}
        onClose={req.onClose}
        sx={{
          "& .MuiDrawer-paper": {
            width: 400,
            padding: 2,
            top: "64px",
          },
        }}>
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Create currency
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          <form onSubmit={handleSubmit(handleOnSubmit)}>
            <Stack spacing={3}>
              <Controller
                name="code"
                control={control}
                rules={{
                  required: "Code must not be empty",
                  pattern: {
                    value: ISO4217_REGEX,
                    message:
                      "Must be a valid ISO 4217 currency code (e.g., USD, LAK)",
                  },
                }}
                render={({
                  field: { ref: fieldRef, value, ...fieldProps },
                  fieldState,
                }) => (
                  <TextField
                    {...fieldProps}
                    label="Code"
                    value={value}
                    variant="outlined"
                    fullWidth
                    inputRef={fieldRef}
                    error={fieldState.invalid}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="exchangeRate"
                control={control}
                rules={{
                  validate: (value) => {
                    if (Number(value) <= 0) {
                      return "Exchange rate must be greater than 0";
                    }
                    return true;
                  },
                }}
                render={({
                  field: { ref: fieldRef, value, ...fieldProps },
                  fieldState,
                }) => (
                  <TextField
                    {...fieldProps}
                    label="Exchange Rate"
                    value={value}
                    variant="outlined"
                    fullWidth
                    inputRef={fieldRef}
                    error={fieldState.invalid}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Stack>

            <Stack
              direction="row"
              justifyContent="flex-end"
              spacing={2}
              sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<CreateIcon />}
                disabled={loading}>
                {loading && (
                  <CircularProgress
                    size={15}
                    sx={{ mr: 1 }}
                    variant="indeterminate"
                  />
                )}
                Create
              </Button>
            </Stack>
          </form>
        </Stack>
      </Drawer>

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

export default DrawerAddCurrency;
