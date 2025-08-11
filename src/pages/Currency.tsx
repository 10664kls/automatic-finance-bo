import {
  Alert,
  Box,
  Button,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { ListCurrencies } from "../api/model";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import API from "../api/axios";
import { Edit } from "@mui/icons-material";
import { DateTime } from "luxon";
import DrawerAddCurrency from "../components/DrawerAddCurrency";
import { formatWithoutCurrency } from "../utils/format";
import DrawerEditCurrency from "../components/DrawerEditCurrency";

const Currency = () => {
  const [openAddDrawer, setOpenAddDrawer] = useState<boolean>(false);
  const [openEditDrawer, setOpenEditDrawer] = useState<boolean>(false);
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>("");
  const [pageToken, setPageToken] = useState<string>("");
  const [previousToken, setPreviousToken] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(100);
  const [pageNumber, setPageNumber] = useState<number>(0);
  const [currencyID, setCurrencyID] = useState<string>("");

  const {
    data: currencies,
    isLoading: isCurrenciesLoading,
    error: listCurrenciesError,
  } = useQuery<ListCurrencies>({
    queryKey: ["listCurrencies", pageToken, pageSize],
    queryFn: async () => {
      const apiURL = new URL(
        `${import.meta.env.VITE_API_BASE_URL}/v1/currencies`
      );
      apiURL.searchParams.set("pageSize", pageSize.toString());
      if (pageToken) {
        apiURL.searchParams.set("pageToken", pageToken);
      }

      const response = await API.get(apiURL.toString());
      if (response.status !== 200) {
        throw Error("Failed to list currencies");
      }
      return response.data;
    },
  });

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

  const createCurrency = async (payload: {
    code: string;
    exchangeRate: number;
  }): Promise<void> => {
    try {
      const response = await API.post("/v1/currencies", payload);

      if (response.status !== 200) {
        throw new Error("Failed to create currency");
      }

      setSuccess("Currency created successfully");
      setShowSnackbar(true);
      return response.data;
    } catch {
      throw new Error("Failed to create currency");
    }
  };

  const updateCurrency = async (payload: {
    exchangeRate: number;
  }): Promise<void> => {
    try {
      const response = await API.patch(`/v1/currencies/${currencyID}`, payload);

      if (response.status !== 200) {
        throw new Error("Failed to update currency");
      }

      setSuccess("Currency updated successfully");
      setShowSnackbar(true);
      return response.data;
    } catch {
      throw new Error("Failed to update currency");
    }
  };

  const indexOfLastItem = (pageNumber + 1) * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;

  return (
    <>
      <Box>
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
              List of currencies
              <Button
                onClick={() => setOpenAddDrawer(true)}
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ whiteSpace: "nowrap", ml: 2 }}>
                Add New
              </Button>
            </Typography>
          </Stack>

          {isCurrenciesLoading && (
            <Box sx={{ padding: 2 }}>
              <Skeleton />
              <Skeleton animation="wave" />
              <Skeleton animation={false} />
            </Box>
          )}

          {listCurrenciesError && (
            <Alert severity="error" sx={{ mb: 1, mt: 1 }}>
              [Error] Something went wrong. Please try again later
            </Alert>
          )}

          {currencies && (
            <TableContainer component={Box}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                      No.
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                      Code
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                      Exchange Rate
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                      Last Updated At
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currencies.currencies.length === 0 && (
                    <TableRow>
                      <TableCell
                        align="center"
                        colSpan={5}
                        sx={{ whiteSpace: "nowrap" }}>
                        No data found
                      </TableCell>
                    </TableRow>
                  )}
                  {currencies.currencies.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell width={"5%"} sx={{ whiteSpace: "nowrap" }}>
                        {idx + 1 + indexOfFirstItem}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                        {row.code}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                        {formatWithoutCurrency(row.exchangeRate)}
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        {DateTime.fromISO(row.updatedAt, {
                          zone: "Asia/Vientiane",
                        }).toFormat("dd/MM/yyyy HH:mm:ss")}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          sx={{
                            justifyContent: "center",
                          }}
                          spacing={1}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => {
                              setCurrencyID(row.id);
                              setOpenEditDrawer(true);
                            }}>
                            Edit
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
            count={currencies ? currencies.currencies.length : 0}
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
                    currencies && currencies.nextPageToken.length > 0
                      ? false
                      : true,
                  onClick: () => {
                    if (currencies && currencies.nextPageToken.length > 0) {
                      const token = currencies.nextPageToken;
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

      <DrawerAddCurrency
        open={openAddDrawer}
        onClose={() => setOpenAddDrawer(false)}
        onSubmit={createCurrency}
      />

      {openEditDrawer && currencyID && (
        <DrawerEditCurrency
          open={openEditDrawer}
          id={currencyID}
          onClose={() => setOpenEditDrawer(false)}
          onSubmit={updateCurrency}
        />
      )}

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
    </>
  );
};

export default Currency;
