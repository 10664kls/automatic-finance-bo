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
import { Edit } from "@mui/icons-material";
import { ListWordings } from "../api/model";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import API from "../api/axios";
import { DateTime } from "luxon";
import DrawerAddWording from "../components/DrawerAddWording";
import DrawerEditWording from "../components/DrawerEditWording";

const Wording = () => {
  const [openAddDrawer, setOpenAddDrawer] = useState<boolean>(false);
  const [openEditDrawer, setOpenEditDrawer] = useState<boolean>(false);
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>("");
  const [wordingID, setWordingID] = useState<number>(0);
  const [pageToken, setPageToken] = useState<string>("");
  const [previousToken, setPreviousToken] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(100);
  const [pageNumber, setPageNumber] = useState<number>(0);

  const {
    data: wordings,
    isLoading: isCurrenciesLoading,
    error: listWordingsError,
  } = useQuery<ListWordings>({
    queryKey: ["listWordings", pageToken, pageSize],
    queryFn: async () => {
      const apiURL = new URL(
        `${import.meta.env.VITE_API_BASE_URL}/v1/incomes/wordlists`
      );
      apiURL.searchParams.set("pageSize", pageSize.toString());
      if (pageToken) {
        apiURL.searchParams.set("pageToken", pageToken);
      }

      const response = await API.get<ListWordings>(apiURL.toString());
      if (response.status !== 200) {
        throw Error("Failed to list income wordlists");
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

  const createWording = async (payload: {
    word: string;
    category: string;
  }): Promise<void> => {
    try {
      const response = await API.post("/v1/incomes/wordlists", payload);

      if (response.status !== 200) {
        throw new Error("Failed to create wording");
      }

      setSuccess("Wording created successfully");
      setShowSnackbar(true);
      return response.data;
    } catch {
      throw new Error("Failed to create wording");
    }
  };

  const updateWording = async (payload: {
    word: string;
    category: string;
  }): Promise<void> => {
    try {
      const response = await API.put(
        `/v1/incomes/wordlists/${wordingID}`,
        payload
      );

      if (response.status !== 200) {
        throw new Error("Failed to update wording");
      }

      setSuccess("Wording updated successfully");
      setShowSnackbar(true);
      return response.data;
    } catch {
      throw new Error("Failed to update wording");
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
              List of wordings
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

          {listWordingsError && (
            <Alert severity="error" sx={{ mb: 1, mt: 1 }}>
              [Error] Something went wrong. Please try again later
            </Alert>
          )}

          {wordings && (
            <TableContainer component={Box}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                      No.
                    </TableCell>
                    <TableCell
                      sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                      Word
                    </TableCell>
                    <TableCell
                      sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                      Category
                    </TableCell>
                    <TableCell
                      sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                      Created At
                    </TableCell>
                    <TableCell
                      sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {wordings.wordlists.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell width={"5%"} sx={{ whiteSpace: "nowrap" }}>
                        {idx + 1 + indexOfFirstItem}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row.word}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row.category}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {DateTime.fromISO(row.createdAt, {
                          zone: "Asia/Vientiane",
                        }).toFormat("dd/MM/yyyy HH:mm:ss")}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => {
                            setWordingID(row.id);
                            setOpenEditDrawer(true);
                          }}>
                          Edit
                        </Button>
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
            count={wordings ? wordings.wordlists.length : 0}
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
                    wordings && wordings.nextPageToken.length > 0
                      ? false
                      : true,
                  onClick: () => {
                    if (wordings && wordings.nextPageToken.length > 0) {
                      const token = wordings.nextPageToken;
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

      <DrawerAddWording
        open={openAddDrawer}
        onClose={() => setOpenAddDrawer(false)}
        onSubmit={createWording}
      />

      {openEditDrawer && wordingID && (
        <DrawerEditWording
          open={openEditDrawer}
          id={wordingID}
          onClose={() => setOpenEditDrawer(false)}
          onSubmit={updateWording}
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

export default Wording;
