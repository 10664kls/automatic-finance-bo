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
import { Business } from "../api/model";
import FormattedNumberInput from "./FormattedNumberInput";

interface DrawerProps {
  open: boolean;
  id: string;
  onClose: () => void;
  onSubmit: (formData: {
    name: string;
    marginPercentage: number;
  }) => Promise<void>;
}

const DrawerEditBusiness = (req: DrawerProps) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: req.onSubmit,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listBusinesses"],
      });
      req.onClose();
    },
    onError: () => {
      setError("Failed to update business segment");
    },
  });

  const {
    data: business,
    isLoading,
    isError,
  } = useQuery({
    queryFn: async () => {
      const response = await API.get<{ business: Business }>(
        `/v1/selfemployed/businesses/${req.id}`
      );
      if (response.status !== 200) {
        throw Error("Failed to get business");
      }
      return response.data.business;
    },
    queryKey: ["getBusiness", req.id],
  });

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: business ? business.name : "",
      marginPercentage: business ? business.marginPercentage : 0,
    },
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  useEffect(() => {
    if (req.open && business) {
      reset({
        name: business.name,
        marginPercentage: business.marginPercentage,
      });
    }
  }, [req.open, reset, business]);

  const handleOnSubmit = (data: { name: string; marginPercentage: number }) => {
    setLoading(true);

    mutation.mutate({
      name: data.name,
      marginPercentage: data.marginPercentage,
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
          Update Business Segment
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
            {business && (
              <Stack spacing={3}>
                <Controller
                  name="name"
                  control={control}
                  rules={{
                    required: "Name must not be empty",
                    minLength: {
                      value: 3,
                      message: "Name must be at least 3 characters",
                    },
                  }}
                  render={({
                    field: { ref: fieldRef, value, ...fieldProps },
                    fieldState,
                  }) => {
                    return (
                      <TextField
                        {...fieldProps}
                        label="Name"
                        variant="outlined"
                        fullWidth
                        value={value}
                        inputRef={fieldRef}
                        error={fieldState.invalid}
                        helperText={fieldState.error?.message}
                      />
                    );
                  }}
                />

                <Controller
                  name="marginPercentage"
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (Number(value) <= 0 || Number(value) > 100) {
                        return "Margin percentage must be between 0 and 100";
                      }
                      return true;
                    },
                  }}
                  render={({
                    field: { ref: fieldRef, value, ...fieldProps },
                    fieldState,
                  }) => (
                    <FormattedNumberInput
                      {...fieldProps}
                      label="Margin Percentage"
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

export default DrawerEditBusiness;
