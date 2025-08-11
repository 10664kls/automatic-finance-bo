"use client";

import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  Backdrop,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CalculateIcon from "@mui/icons-material/Calculate";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useForm, Controller } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import type { CIBCalculation, Metadata } from "../../api/model";
import { type FC, useRef, useState } from "react";
import { AxiosError } from "axios";

type FormData = {
  number: string;
  cibFileName: string;
};

const CIBCalculator: FC = () => {
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
  const [calculating, setCalculating] = useState(false);

  const onSubmit = async (data: FormData) => {
    setCalculating(true);
    try {
      const response = await API.post<{ calculation: CIBCalculation }>(
        "/v1/cib/calculations",
        data
      );
      if (response.status === 200) {
        setShowSnackbar(true);
        setSubmitSuccess(true);
        navigate(`/cib-calculations/${response.data.calculation.number}`);
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
    } finally {
      setCalculating(false);
    }
  };

  const handleFile = (file: File) => {
    const allowedTypes = ["application/pdf"];

    if (!allowedTypes.includes(file.type)) {
      setFileError("Only PDF files (.pdf) are allowed");
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
    clearErrors("cibFileName");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await API.post<{ metadata: Metadata }>(
        "/v1/files/cib",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const uploadedUrl = response.data.metadata.name;
      setValue("cibFileName", uploadedUrl);
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
          CIB Calculation
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Controller
            name="number"
            control={control}
            defaultValue=""
            rules={{ required: "Facility/LO Number is required" }}
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
            name="cibFileName"
            control={control}
            defaultValue=""
            rules={{ required: "CIB file is required" }}
            render={({ fieldState }) => (
              <Box mt={2}>
                <Typography
                  variant="subtitle1"
                  color={
                    fileError || fieldState.error ? "error" : "text.primary"
                  }
                  gutterBottom>
                  CIB file in PDF format (.PDF) *
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
                        ? "primary" // light red background for error
                        : isDragging
                        ? "background.default" // light gray on drag
                        : "primary", // default
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
                    Drag and drop PDF file here
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
                      accept="application/pdf"
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

          <Stack spacing={1} direction="row" justifyContent="flex-end" mt={4}>
            <Button
              startIcon={<ArrowBackIcon />}
              component={RouterLink}
              to="/cib-calculations"
              variant="outlined"
              sx={{ whiteSpace: "nowrap" }}>
              Back
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={uploading || calculating}
              startIcon={
                calculating ? (
                  <CircularProgress size={20} thickness={4} />
                ) : (
                  <CalculateIcon />
                )
              }>
              {calculating ? "Calculating..." : "Calculate"}
            </Button>
          </Stack>
        </form>
      </Paper>
      {/* Calculation Loading Backdrop */}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
        }}
        open={calculating}>
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 2,
            textAlign: "center",
            minWidth: 300,
            backgroundColor: "white",
            color: "text.primary",
          }}>
          <Box sx={{ mb: 3 }}>
            <CircularProgress size={60} thickness={4} />
          </Box>

          <Typography variant="h6" gutterBottom color="primary">
            Calculating CIB...
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Please wait while we process your calculation
          </Typography>
        </Paper>
      </Backdrop>
    </Box>
  );
};

export default CIBCalculator;
