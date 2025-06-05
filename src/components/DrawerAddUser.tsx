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
import { Controller, useForm, useWatch } from "react-hook-form";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    email: string;
    displayName: string;
    password: string;
  }) => Promise<void>;
}

const DrawerAddUser = (req: DrawerProps) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: req.onSubmit,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listUsers"],
      });
      req.onClose();
    },
    onError: () => {
      setError("Failed to create user");
    },
  });

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      email: "",
      displayName: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  useEffect(() => {
    if (req.open) {
      reset({
        email: "",
        password: "",
        displayName: "",
        confirmPassword: "",
      });
    }
  }, [req.open, reset]);

  const password = useWatch({ control, name: "password" });

  const handleOnSubmit = (data: {
    email: string;
    password: string;
    displayName: string;
  }) => {
    setLoading(true);

    mutation.mutate({
      email: data.email,
      password: data.password,
      displayName: data.displayName,
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
          Create user
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Stack spacing={3}>
          <form onSubmit={handleSubmit(handleOnSubmit)}>
            <Stack spacing={3}>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "Email must not be empty",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Email must be a valid email",
                  },
                }}
                render={({
                  field: { ref: fieldRef, value, ...fieldProps },
                  fieldState,
                }) => (
                  <TextField
                    {...fieldProps}
                    label="Email"
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
                name="displayName"
                control={control}
                rules={{
                  required: "Display name must not be empty",
                  minLength: {
                    value: 3,
                    message: "Display name must be at least 3 characters",
                  },
                  maxLength: {
                    value: 50,
                    message: "Display name must be at most 50 characters",
                  },
                }}
                render={({
                  field: { ref: fieldRef, value, ...fieldProps },
                  fieldState,
                }) => (
                  <TextField
                    {...fieldProps}
                    label="Display Name"
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
                name="password"
                control={control}
                rules={{
                  required: "Password must not be empty",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                  maxLength: {
                    value: 50,
                    message: "Password must be at most 50 characters",
                  },
                }}
                render={({
                  field: { ref: fieldRef, value, ...fieldProps },
                  fieldState,
                }) => (
                  <TextField
                    type="password"
                    {...fieldProps}
                    label="Password"
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
                name="confirmPassword"
                control={control}
                rules={{
                  required: "Confirm password must not be empty",
                  validate: (value) => {
                    if (value !== password) {
                      return "Passwords do not match";
                    }
                    return true;
                  },
                }}
                render={({
                  field: { ref: fieldRef, value, ...fieldProps },
                  fieldState,
                }) => (
                  <TextField
                    type="password"
                    {...fieldProps}
                    label="Confirm Password"
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

export default DrawerAddUser;
