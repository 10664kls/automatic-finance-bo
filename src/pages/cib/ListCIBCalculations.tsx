import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Stack,
  Button,
  Box,
  TextField,
  Skeleton,
  TablePagination,
  Grid,
  Alert,
  Snackbar,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import ClearIcon from "@mui/icons-material/Clear";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { DateTime } from "luxon";
import API from "../../api/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatCurrency, formatWithoutCurrency } from "../../utils/format";
import { ListCIBCalculations as ListCalculations } from "../../api/model";

const cibTableHeaders = [
  "No.",
  "Facility/LO",
  "Customer NAme",
  "Total Loan",
  "Total Closed Loan",
  "Total Active Loan",
  "Total Installment (CIB)",
  "Created At",
  "Actions",
];

interface Filter {
  number: string;
  customer: string;
  from: DateTime | null;
  to: DateTime | null;
  pageToken: string;
  pageSize: number;
}

const listCalculations = async (f: Filter): Promise<ListCalculations> => {
  const apiURL = new URL(
    `${import.meta.env.VITE_API_BASE_URL}/v1/cib/calculations`
  );
  apiURL.searchParams.set("pageSize", f.pageSize.toString());

  if (f.number) {
    apiURL.searchParams.set("number", f.number);
  }
  if (f.customer) {
    apiURL.searchParams.set("customer", f.customer);
  }
  if (f.from) {
    apiURL.searchParams.set("createdAfter", f.from.toString());
  }
  if (f.to) {
    const toDate = f.to.plus({ hours: 23, minutes: 59, seconds: 59 });
    apiURL.searchParams.set("createdBefore", toDate.toString());
  }
  if (f.pageToken) {
    apiURL.searchParams.set("pageToken", f.pageToken);
  }

  const response = await API.get<ListCalculations>(apiURL.toString());
  if (response.status !== 200) {
    throw Error("Failed to get calculations");
  }

  return response.data;
};

const ListCIBCalculations = () => {
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [number, setNumber] = useState<string>("");
  const [customer, setCustomer] = useState<string>("");
  const [from, setFrom] = useState<DateTime | null>(null);
  const [to, setTo] = useState<DateTime | null>(null);
  const [pageToken, setPageToken] = useState<string>("");
  const [previousToken, setPreviousToken] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(100);
  const [pageNumber, setPageNumber] = useState<number>(0);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {},
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listCIBCalculations"],
      });
    },
  });

  const {
    data: calculations,
    isLoading: isCalculationsLoading,
    error: listCalculationsError,
  } = useQuery<ListCalculations>({
    queryKey: ["listCIBCalculations", pageToken, pageSize],
    queryFn: () =>
      listCalculations({
        number,
        customer,
        from,
        to,
        pageToken,
        pageSize,
      }),
  });

  const handleFilter = () => {
    mutation.mutate();
  };

  const handleClearFilter = () => {
    setNumber("");
    setCustomer("");
    setFrom(null);
    setTo(null);
    setPageToken("");
    setPageSize(100);
    mutation.mutate();
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setPageSize(parseInt(event.target.value));
  };

  const getPreviousToken = (): string => {
    const token = previousToken[previousToken.length - 1];
    setPreviousToken((t) => t.slice(0, t.length - 1));
    return token;
  };

  const handPreviousToken = (token: string) => {
    setPreviousToken((t) => [...t, token]);
  };

  const handleExportCalculationsToExcel = async () => {
    const apiURL = new URL(
      `${import.meta.env.VITE_API_BASE_URL}/v1/cib/calculations/export-to-excel`
    );
    if (from) {
      apiURL.searchParams.set("createdAfter", from.toString());
    }
    if (to) {
      const toDate = to.plus({ hours: 23, minutes: 59, seconds: 59 });
      apiURL.searchParams.set("createdBefore", toDate.toString());
    }
    if (number) {
      apiURL.searchParams.set("number", number);
    }

    try {
      const resp = await API.get(apiURL.toString(), { responseType: "blob" });
      if (resp.status !== 200) {
        throw new Error(resp.statusText);
      }

      const blob = resp.data;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "CIB_Calculations_Report.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSuccess("Export Calculations to Excel successfully");
      setShowSnackbar(true);
      return;
    } catch {
      setError("Failed to export to Excel. Please try again.");
      setShowSnackbar(true);
    }
  };

  const handleExportCalculationToExcelByNumber = async (number: string) => {
    try {
      const resp = await API.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/v1/cib/calculations/${number}/export-to-excel`,
        { responseType: "blob" }
      );
      if (resp.status !== 200) {
        throw new Error(resp.statusText);
      }

      const blob = resp.data;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `CIB_Calculation_${number}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowSnackbar(true);
      setSuccess("Export CIB Calculation to Excel successfully");
    } catch {
      setError("Failed to export to Excel. Please try again.");
      setShowSnackbar(true);
    }
  };

  const indexOfLastItem = (pageNumber + 1) * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;

  return (
    <>
      <Box>
        <Paper sx={{ padding: 2, mb: 2 }}>
          <Grid
            container
            spacing={2}
            direction={{
              sm: "column",
              md: "row",
            }}
            sx={{
              mb: 2,
            }}>
            <Grid
              size={{
                xs: 12,
                sm: 12,
                md: 2,
              }}
              sx={{ mt: 0.5 }}>
              <TextField
                fullWidth
                label="Facility/LO Number"
                variant="standard"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 12,
                md: 2,
              }}
              sx={{ mt: 0.5 }}>
              <TextField
                fullWidth
                label="Customer Name"
                variant="standard"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 12,
                md: 2,
              }}>
              <LocalizationProvider dateAdapter={AdapterLuxon}>
                <DatePicker
                  format="dd/MM/yyyy"
                  label="From"
                  onChange={(setValue) => setFrom(setValue)}
                  value={from}
                  slotProps={{
                    textField: {
                      name: "from",
                      id: "from",
                      variant: "standard",
                      fullWidth: true,
                      size: "small",
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 12,
                md: 2,
              }}>
              <LocalizationProvider dateAdapter={AdapterLuxon}>
                <DatePicker
                  format="dd/MM/yyyy"
                  label="To"
                  onChange={(setValue) => setTo(setValue)}
                  value={to}
                  slotProps={{
                    textField: {
                      name: "to",
                      id: "to",
                      fullWidth: true,
                      variant: "standard",
                      size: "small",
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 12,
                md: 2,
              }}
              sx={{
                mt: 1.5,
              }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleClearFilter}
                  startIcon={<ClearIcon />}>
                  Clear
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleFilter}
                  startIcon={<SearchIcon />}>
                  Filter
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}>
            <Typography variant="h6">
              CIB Calculations
              <Button
                component={RouterLink}
                to="/cib-calculations/new"
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ whiteSpace: "nowrap", ml: 1 }}>
                Add New
              </Button>
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportCalculationsToExcel}>
                Export
              </Button>
            </Stack>
          </Stack>

          {isCalculationsLoading && (
            <Box sx={{ padding: 2 }}>
              <Skeleton />
              <Skeleton animation="wave" />
              <Skeleton animation={false} />
            </Box>
          )}

          {listCalculationsError && (
            <Alert severity="error" sx={{ mb: 1, mt: 1 }}>
              [Error] Something went wrong. Please try again later
            </Alert>
          )}

          {calculations && (
            <TableContainer component={Box}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {cibTableHeaders.map((header) => (
                      <TableCell
                        key={header}
                        sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {calculations.calculations.length === 0 && (
                    <TableRow>
                      <TableCell
                        align="center"
                        colSpan={cibTableHeaders.length}>
                        No data found
                      </TableCell>
                    </TableRow>
                  )}

                  {calculations.calculations.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{idx + 1 + indexOfFirstItem}</TableCell>
                      <TableCell>{row.number}</TableCell>
                      <TableCell>{row.customer.displayName}</TableCell>
                      <TableCell>
                        {formatWithoutCurrency(row.aggregateQuantity.total)}
                      </TableCell>
                      <TableCell>
                        {formatWithoutCurrency(row.aggregateQuantity.closed)}
                      </TableCell>
                      <TableCell>
                        {formatWithoutCurrency(row.aggregateQuantity.active)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(row.totalInstallmentInLAK)}
                      </TableCell>
                      <TableCell>
                        {new Date(row.createdAt).toLocaleDateString("lo-LA")}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button
                            startIcon={<VisibilityIcon />}
                            size="small"
                            variant="outlined"
                            color="primary"
                            component={RouterLink}
                            to={`/cib-calculations/${row.number}`}>
                            Preview
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() =>
                              handleExportCalculationToExcelByNumber(row.number)
                            }>
                            Export
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <TablePagination
            component="div"
            rowsPerPage={pageSize}
            page={pageNumber}
            count={calculations ? calculations.calculations.length : 0}
            onPageChange={() => {}}
            onRowsPerPageChange={handlePageSizeChange}
            labelRowsPerPage="Page Size"
            labelDisplayedRows={() => ``}
            rowsPerPageOptions={[100, 200]}
            slotProps={{
              actions: {
                previousButton: {
                  disabled: previousToken.length >= 1 ? false : true,
                  onClick: () => {
                    if (pageNumber > 0 && previousToken.length > 0) {
                      setPageNumber(pageNumber - 1);
                      if (previousToken.length == 1) {
                        setPreviousToken([]);
                        setPageToken("");
                        return;
                      }

                      const token = getPreviousToken();
                      setPageToken(token);
                    }
                  },
                },
                nextButton: {
                  disabled:
                    calculations && calculations.nextPageToken.length > 0
                      ? false
                      : true,
                  onClick: () => {
                    if (calculations && calculations.nextPageToken.length > 0) {
                      const token = calculations.nextPageToken;
                      setPageNumber(pageNumber + 1);
                      setPageToken(token);
                      handPreviousToken(token);
                    }
                  },
                },
              },
            }}
          />
        </Paper>
      </Box>

      {success && showSnackbar && (
        <Snackbar
          open={showSnackbar}
          autoHideDuration={3000}
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert
            onClose={() => setShowSnackbar(false)}
            severity="success"
            sx={{ width: "100%" }}>
            {success}
          </Alert>
        </Snackbar>
      )}

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

export default ListCIBCalculations;
