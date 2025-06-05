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
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  Alert,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ListCalculations } from "../../api/model";
import API from "../../api/axios";
import { formatCurrency } from "../../utils/format";
import { DateTime } from "luxon";
import { useState } from "react";

const incomeTableHeaders = [
  "No.",
  "FLAPPL/LO NO",
  "Product",
  "Average Income/Month",
  "Account Number",
  "Bank Account Name",
  "Period Account",
  "Currency",
  "Net Income Amount",
  "Actions",
];

interface Filter {
  number: string;
  product: string;
  accountName: string;
  from: DateTime | null;
  to: DateTime | null;
  pageToken: string;
  pageSize: number;
}

const listCalculations = async (f: Filter): Promise<ListCalculations> => {
  const apiURL = new URL(
    `${import.meta.env.VITE_API_BASE_URL}/v1/incomes/calculations`
  );
  apiURL.searchParams.set("pageSize", f.pageSize.toString());

  if (f.number) {
    apiURL.searchParams.set("number", f.number);
  }
  if (f.product !== "" && f.product !== "ALL") {
    apiURL.searchParams.set("product", f.product);
  }
  if (f.accountName) {
    apiURL.searchParams.set("accountDisplayName", f.accountName);
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

const ListIncomeCalculations = () => {
  const [product, setProduct] = useState<string>("ALL");
  const [number, setNumber] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");
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
        queryKey: ["listCalculations"],
      });
    },
  });

  const {
    data: calculations,
    isLoading: isCalculationsLoading,
    error: listCalculationsError,
  } = useQuery<ListCalculations>({
    queryKey: ["listCalculations", pageToken, pageSize],
    queryFn: () =>
      listCalculations({
        number,
        product,
        accountName,
        from,
        to,
        pageToken,
        pageSize,
      }),
  });

  const handleExport = () => {
    // TODO: export to Excel logic
    alert("Export to Excel clicked");
  };

  const handleFilter = () => {
    mutation.mutate();
  };

  const handleClearFilter = () => {
    setProduct("ALL");
    setNumber("");
    setAccountName("");
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

  const indexOfLastItem = (pageNumber + 1) * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;

  return (
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
            <FormControl fullWidth variant="standard">
              <InputLabel id="product">Product</InputLabel>
              <Select
                labelId="product"
                id="product"
                label="Product"
                size="small"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                fullWidth>
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="SF">SF</MenuItem>
                <MenuItem value="PL">PL</MenuItem>
                <MenuItem value="SA">SA</MenuItem>
              </Select>
            </FormControl>
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
              label="FLAPPL/LO NO"
              variant="standard"
              size="small"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
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
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              label="Bank Account Name"
              variant="standard"
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
                value={from}
                onChange={(newValue) => setFrom(newValue)}
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
                value={to}
                onChange={(newValue) => setTo(newValue)}
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
              sx={{
                justifyContent: "flex-end",
              }}>
              <Button
                onClick={handleClearFilter}
                variant="outlined"
                color="primary"
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

      <Paper
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
        }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}>
          <Typography variant="h6">
            Income Calculations
            <Button
              component={RouterLink}
              to="/income-calculations/new"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ whiteSpace: "nowrap", ml: 2 }}>
              Add New
            </Button>
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}>
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
                  {incomeTableHeaders.map((header) => (
                    <TableCell
                      key={header}
                      sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {calculations.calculations.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {idx + 1 + indexOfFirstItem}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {row.number}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {row.product}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {formatCurrency(
                        row.monthlyAverageIncome,
                        row.account.currency
                      )}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {row.account.number}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {row.account.displayName}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {`${DateTime.fromISO(row.startedAt, {
                        zone: "Asia/Vientiane",
                      }).toFormat("dd/MM/yyyy")} - ${DateTime.fromISO(
                        row.endedAt,
                        {
                          zone: "Asia/Vientiane",
                        }
                      ).toFormat("dd/MM/yyyy")}`}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {row.account.currency}
                    </TableCell>
                    <TableCell
                      sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                      {formatCurrency(row.monthlyNetIncome)}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      <Stack direction="row" spacing={1}>
                        <Button
                          startIcon={<VisibilityIcon />}
                          size="small"
                          variant="outlined"
                          color="primary"
                          component={RouterLink}
                          to={`/income-calculations/${row.number}`}>
                          Preview
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => ""}>
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
  );
};

export default ListIncomeCalculations;
