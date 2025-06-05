import {
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CalculateIcon from "@mui/icons-material/Calculate";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useForm, Controller } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { Calculation, Metadata } from "../../api/model";
import { useRef, useState } from "react";
import { AxiosError } from "axios";

type FormData = {
  number: string;
  product: string;
  statementFileName: string;
};

const IncomeCalculator: React.FC = () => {
  const { handleSubmit, control, setValue, clearErrors } = useForm<FormData>();
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const selectedFile = useRef<File | null>(null);

  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    try {
      const response = await API.post<{ calculation: Calculation }>(
        "/v1/incomes/calculations",
        data
      );
      if (response.status === 200) {
        setShowSnackbar(true);
        setSubmitSuccess(true);
        navigate(`/income-calculations/${response.data.calculation.number}`);
        return;
      }

      throw new Error("Failed to submit form");
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        switch (error.response?.status) {
          case 409:
            setShowSnackbar(true);
            setSubmitError(
              "Calculation with this number already exists. Please use a different number."
            );
            break;

          case 400:
            setShowSnackbar(true);
            setSubmitError(
              "Invalid data provided. Please check your inputs and try again."
            );
            break;

          default:
            setShowSnackbar(true);
            setSubmitError("Something went wrong. Please try again.");
            break;
        }

        return;
      }

      setShowSnackbar(true);
      setSubmitError("Something went wrong. Please try again.");
    }
  };

  const handleFile = (file: File) => {
    const allowedTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowedTypes.includes(file.type)) {
      setFileError("Only Excel files (.xls or .xlsx) are allowed");
      return;
    }

    setFileError(null);
    selectedFile.current = file;
    handleFileUpload(file);
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadSuccess(false);
    setFileError(null);
    clearErrors("statementFileName");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await API.post<{ metadata: Metadata }>(
        "/v1/files/statements",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const uploadedUrl = response.data.metadata.name;
      setValue("statementFileName", uploadedUrl);
      setUploadSuccess(true);
      setShowSnackbar(true);
    } catch (err) {
      console.error("File upload failed:", err);
      setFileError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box
      sx={{
        mt: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh", // Adjust as needed
      }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          maxWidth: 650,
          width: "100%",
        }}>
        <Typography variant="h4" gutterBottom>
          Income Calculation
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Controller
            name="number"
            control={control}
            defaultValue=""
            rules={{
              required: "Facility/LO Number is required",
              maxLength: 150,
              validate: (value) => {
                if (value.length < 3) {
                  return "Facility/LO Number must be at least 3 characters";
                }
              },
            }}
            render={({ field, fieldState }) => (
              <TextField
                required
                {...field}
                label="Facility/LO Number"
                fullWidth
                margin="normal"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="product"
            control={control}
            defaultValue=""
            rules={{ required: "Product is required" }}
            render={({ field, fieldState }) => (
              <FormControl fullWidth margin="normal" error={!!fieldState.error}>
                <InputLabel id="type-label">Product *</InputLabel>
                <Select
                  required
                  {...field}
                  labelId="type-label"
                  label="Product">
                  <MenuItem value="SA">SA</MenuItem>
                  <MenuItem value="SF">SF</MenuItem>
                  <MenuItem value="PL">PL</MenuItem>
                </Select>
                {fieldState.error && (
                  <Typography variant="body2" color="error" mt={0.5}>
                    {fieldState.error.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />

          <Controller
            name="statementFileName"
            control={control}
            defaultValue=""
            rules={{ required: "Statement file is required" }}
            render={({ fieldState }) => (
              <Box mt={2}>
                <Typography
                  variant="subtitle1"
                  color={
                    fileError || fieldState.error ? "error" : "text.primary"
                  }
                  gutterBottom>
                  Statement file in Excel format (.xls or .xlsx) *
                </Typography>

                <Box
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFile(file);
                  }}
                  sx={{
                    border: "2px dashed #ccc",
                    p: 3,
                    borderRadius: 2,
                    textAlign: "center",
                    cursor: "pointer",
                    borderColor:
                      fileError || fieldState.error ? "error.main" : "grey.400",
                    backgroundColor:
                      fileError || fieldState.error
                        ? "#fdecea" // light red background for error
                        : isDragging
                        ? "#f5f5f5" // light gray on drag
                        : "#fafafa", // default
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      borderColor:
                        fileError || fieldState.error
                          ? "error.dark"
                          : "primary.main",
                    },
                  }}>
                  <UploadFileIcon
                    sx={{
                      fontSize: 40,
                      color:
                        fileError || fieldState.error
                          ? "error.main"
                          : "action.active",
                    }}
                  />
                  <Typography
                    variant="body2"
                    mt={1}
                    color={
                      fileError || fieldState.error ? "error" : "text.secondary"
                    }>
                    Drag and drop Excel file here
                  </Typography>
                  <Typography
                    variant="body2"
                    color={
                      fileError || fieldState.error ? "error" : "text.secondary"
                    }>
                    or
                  </Typography>
                  <Button
                    color={fileError || fieldState.error ? "error" : "primary"}
                    variant="outlined"
                    component="label"
                    sx={{ mt: 1 }}
                    disabled={uploading}>
                    Browse
                    <input
                      type="file"
                      hidden
                      accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                      }}
                    />
                  </Button>
                </Box>

                {fileError && (
                  <Typography variant="body2" color="error" mt={1}>
                    {fileError}
                  </Typography>
                )}

                {fieldState.error && !fileError && (
                  <Typography variant="body2" color="error" mt={1}>
                    {fieldState.error.message}
                  </Typography>
                )}

                {selectedFile.current && (
                  <Typography variant="body2" mt={1}>
                    Selected: <strong>{selectedFile.current.name}</strong>
                  </Typography>
                )}
              </Box>
            )}
          />

          {uploadSuccess && (
            <Snackbar
              open={showSnackbar}
              autoHideDuration={3000}
              onClose={() => setShowSnackbar(false)}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}>
              <Alert
                onClose={() => setShowSnackbar(false)}
                severity="success"
                sx={{ width: "100%" }}>
                File uploaded successfully!
              </Alert>
            </Snackbar>
          )}

          {submitSuccess && (
            <Snackbar
              open={showSnackbar}
              autoHideDuration={3000}
              onClose={() => setShowSnackbar(false)}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}>
              <Alert
                onClose={() => setShowSnackbar(false)}
                severity="success"
                sx={{ width: "100%" }}>
                Income calculated successfully!
              </Alert>
            </Snackbar>
          )}

          {submitError && (
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

          <Stack spacing={1} direction="row" justifyContent="flex-end" mt={4}>
            <Button
              startIcon={<ArrowBackIcon />}
              component={RouterLink}
              to="/income-calculations"
              variant="outlined"
              sx={{ whiteSpace: "nowrap" }}>
              Back
            </Button>
            <Button
              startIcon={<CalculateIcon />}
              type="submit"
              variant="contained"
              color="primary"
              disabled={uploading}
              endIcon={uploading ? <CircularProgress size={20} /> : undefined}>
              Calculate
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default IncomeCalculator;
