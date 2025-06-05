import {
  Alert,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
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
  onSubmit: (formData: { word: string; category: string }) => Promise<void>;
}

const DrawerEditWording = (req: DrawerProps) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: req.onSubmit,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listWordings"],
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
      category: "",
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
        `/v1/incomes/wordlists/${req.id}`
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
        category: wording.category,
        word: wording.word,
      });
    }
  }, [req.open, reset, wording]);

  const handleOnSubmit = (data: { word: string; category: string }) => {
    setLoading(true);

    mutation.mutate({
      word: data.word,
      category: data.category,
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

              <Controller
                name="category"
                control={control}
                rules={{
                  required: "Category must not be empty",
                  validate: (value) => {
                    if (!value) {
                      return "Please select a category";
                    }
                  },
                }}
                render={({ field, fieldState }) => (
                  <FormControl
                    variant="outlined"
                    fullWidth
                    error={!!fieldState.error}>
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      labelId="category-label"
                      label="Category"
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}>
                      <MenuItem value="SALARY">Salary</MenuItem>
                      <MenuItem value="ALLOWANCE">Allowance</MenuItem>
                      <MenuItem value="COMMISSION">Commission/OT</MenuItem>
                    </Select>
                    {fieldState.error && (
                      <FormHelperText>
                        {fieldState.error.message}
                      </FormHelperText>
                    )}
                  </FormControl>
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

export default DrawerEditWording;
