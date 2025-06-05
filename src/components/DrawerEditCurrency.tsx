import {
  Alert,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  Skeleton,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import API from "../api/axios";
import { Currency } from "../api/model";

interface DrawerProps {
  open: boolean;
  id: string;
  onClose: () => void;
  onSubmit: (formData: { exchangeRate: number }) => Promise<void>;
}

const DrawerEditCurrency = (req: DrawerProps) => {
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
      setError("Failed to update currency exchange rate");
    },
  });

  const {
    data: currency,
    isLoading,
    isError,
  } = useQuery({
    queryFn: async () => {
      const response = await API.get<{ currency: Currency }>(
        `/v1/currencies/${req.id}`
      );
      if (response.status !== 200) {
        throw Error("Failed to get currency");
      }
      return response.data.currency;
    },
    queryKey: ["getCurrency", req.id],
  });

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      code: currency ? currency.code : "",
      exchangeRate: currency ? currency.exchangeRate : 0,
    },
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  useEffect(() => {
    if (req.open && currency) {
      reset({
        code: currency.code,
        exchangeRate: currency.exchangeRate,
      });
    }
  }, [req.open, reset, currency]);

  const handleOnSubmit = (data: { exchangeRate: number }) => {
    setLoading(true);

    mutation.mutate({
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
          Update Exchange Rate
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {isLoading && (
          <>
            <Skeleton />
            <Skeleton animation="wave" />
            <Skeleton animation={false} />
          </>
        )}

        <Stack spacing={3}>
          <form onSubmit={handleSubmit(handleOnSubmit)}>
            {currency && (
              <Stack spacing={3}>
                <TextField
                  label="Code"
                  fullWidth
                  value={currency.code}
                  disabled
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
            )}

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
                startIcon={<SaveIcon />}
                disabled={loading}>
                {loading && (
                  <CircularProgress
                    size={15}
                    sx={{ mr: 1 }}
                    variant="indeterminate"
                  />
                )}
                Save
              </Button>
            </Stack>
          </form>
        </Stack>
      </Drawer>

      <Snackbar
        open={isError || !!error}
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

export default DrawerEditCurrency;
