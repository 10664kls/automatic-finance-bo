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
import { Controller, useForm, useWatch } from "react-hook-form";
import API from "../api/axios";
import { User } from "../api/model";

interface DrawerProps {
  open: boolean;
  id: string;
  onClose: () => void;
  onSubmit: (formData: { password: string }) => Promise<void>;
}

const DrawerResetPassword = (req: DrawerProps) => {
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
      setError("Failed to reset user password");
    },
  });

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryFn: async () => {
      const response = await API.get<{ user: User }>(
        `/v1/auth/users/${req.id}`
      );
      if (response.status !== 200) {
        throw Error("Failed to get user");
      }
      return response.data.user;
    },
    queryKey: ["getUser", req.id],
  });

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  const password = useWatch({ control, name: "password" });

  useEffect(() => {
    if (req.open && user) {
      reset({
        password: "",
        confirmPassword: "",
      });
    }
  }, [req.open, reset, user]);

  const handleOnSubmit = (data: { password: string }) => {
    setLoading(true);

    mutation.mutate({
      password: data.password,
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
          Reset User Password
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
            {user && (
              <Stack spacing={3}>
                <TextField
                  label="Email"
                  value={user.email}
                  variant="outlined"
                  fullWidth
                  disabled
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

export default DrawerResetPassword;
