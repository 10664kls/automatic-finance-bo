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
import CloseIcon from "@mui/icons-material/Close";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import API from "../api/axios";
import { Wording } from "../api/model";
import { Save } from "@mui/icons-material";

interface DrawerProps {
  open: boolean;
  id: number;
  onClose: () => void;
  onSubmit: (formData: { word: string }) => Promise<void>;
}

const DrawerEditSelfEmployedWording = (req: DrawerProps) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: req.onSubmit,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listSelfEmployedWordings"],
      });
      req.onClose();
    },
    onError: () => {
      setError("Failed to update wording");
    },
  });

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      word: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  const {
    data: wording,
    isLoading,
    isError,
  } = useQuery({
    queryFn: async () => {
      const response = await API.get<{ wordlist: Wording }>(
        `/v1/selfemployed/wordlists/${req.id}`
      );
      if (response.status !== 200) {
        throw Error("Failed to get wording");
      }
      return response.data.wordlist;
    },
    queryKey: ["getCurrency", req.id],
  });

  useEffect(() => {
    if (req.open && wording) {
      reset({
        word: wording.word,
      });
    }
  }, [req.open, reset, wording]);

  const handleOnSubmit = (data: { word: string }) => {
    setLoading(true);

    mutation.mutate({
      word: data.word,
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
          Update Wording {wording?.word}
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
            <Stack spacing={3}>
              <Controller
                name="word"
                control={control}
                rules={{
                  required: "Word must not be empty",
                  validate: (value) => {
                    if (value.length < 2) {
                      return "Word must be at least 2 characters long";
                    }
                  },
                }}
                render={({
                  field: { ref: fieldRef, value, ...fieldProps },
                  fieldState,
                }) => (
                  <TextField
                    {...fieldProps}
                    autoFocus
                    label="Word"
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
                startIcon={<Save />}
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

export default DrawerEditSelfEmployedWording;
