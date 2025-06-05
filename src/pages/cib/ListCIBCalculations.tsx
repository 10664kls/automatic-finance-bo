import { useEffect, useState } from "react";
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
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import ClearIcon from "@mui/icons-material/Clear";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";

type LoanSummary = {
  facilityNumber: string;
  customerName: string;
  totalLoan: number;
  totalClosedLoan: number;
  totalActiveLoan: number;
  totalInstallmentCib: number;
  createdAt: string;
};

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

const formatCurrency = (value: number) => `₭${value.toLocaleString("en-US")}`;

const ListCIBCalculations = () => {
  const [data, setData] = useState<LoanSummary[] | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setData([
        {
          facilityNumber: "FAC-001",
          customerName: "Sam Moore",
          totalLoan: 19838326,
          totalClosedLoan: 2068390,
          totalActiveLoan: 17769936,
          totalInstallmentCib: 384170,
          createdAt: "2024-04-20",
        },
        {
          facilityNumber: "FAC-002",
          customerName: "Taylor Johnson",
          totalLoan: 20810979,
          totalClosedLoan: 2310819,
          totalActiveLoan: 18500160,
          totalInstallmentCib: 887006,
          createdAt: "2024-11-30",
        },
        {
          facilityNumber: "FAC-003",
          customerName: "Chris Miller",
          totalLoan: 32674299,
          totalClosedLoan: 13951987,
          totalActiveLoan: 18722312,
          totalInstallmentCib: 180112,
          createdAt: "2024-03-25",
        },
        {
          facilityNumber: "FAC-004",
          customerName: "Chris Lee",
          totalLoan: 22108977,
          totalClosedLoan: 1521798,
          totalActiveLoan: 20587179,
          totalInstallmentCib: 457794,
          createdAt: "2024-08-28",
        },
        {
          facilityNumber: "FAC-005",
          customerName: "Alex Doe",
          totalLoan: 12755731,
          totalClosedLoan: 1905545,
          totalActiveLoan: 10850186,
          totalInstallmentCib: 922064,
          createdAt: "2024-09-06",
        },
        {
          facilityNumber: "FAC-006",
          customerName: "Taylor Clark",
          totalLoan: 34594572,
          totalClosedLoan: 10188378,
          totalActiveLoan: 24406194,
          totalInstallmentCib: 210807,
          createdAt: "2024-04-01",
        },
        {
          facilityNumber: "FAC-007",
          customerName: "Morgan Smith",
          totalLoan: 45774131,
          totalClosedLoan: 13336300,
          totalActiveLoan: 32437831,
          totalInstallmentCib: 830405,
          createdAt: "2024-01-15",
        },
        {
          facilityNumber: "FAC-008",
          customerName: "Taylor Miller",
          totalLoan: 15541663,
          totalClosedLoan: 4817365,
          totalActiveLoan: 10724298,
          totalInstallmentCib: 239583,
          createdAt: "2024-03-19",
        },
        {
          facilityNumber: "FAC-009",
          customerName: "Taylor Moore",
          totalLoan: 22335588,
          totalClosedLoan: 3561179,
          totalActiveLoan: 18774409,
          totalInstallmentCib: 187633,
          createdAt: "2024-09-22",
        },
        {
          facilityNumber: "FAC-010",
          customerName: "John Miller",
          totalLoan: 14338983,
          totalClosedLoan: 1693562,
          totalActiveLoan: 12645421,
          totalInstallmentCib: 806190,
          createdAt: "2024-12-31",
        },
        {
          facilityNumber: "FAC-011",
          customerName: "Sam Johnson",
          totalLoan: 25623787,
          totalClosedLoan: 6627567,
          totalActiveLoan: 18996220,
          totalInstallmentCib: 653914,
          createdAt: "2024-11-19",
        },
        {
          facilityNumber: "FAC-012",
          customerName: "Jane Johnson",
          totalLoan: 17183731,
          totalClosedLoan: 2893938,
          totalActiveLoan: 14289793,
          totalInstallmentCib: 401728,
          createdAt: "2024-02-15",
        },
        {
          facilityNumber: "FAC-013",
          customerName: "Jane Miller",
          totalLoan: 18085299,
          totalClosedLoan: 3999081,
          totalActiveLoan: 14086218,
          totalInstallmentCib: 286964,
          createdAt: "2024-07-05",
        },
        {
          facilityNumber: "FAC-014",
          customerName: "John Johnson",
          totalLoan: 39067406,
          totalClosedLoan: 16312601,
          totalActiveLoan: 22754805,
          totalInstallmentCib: 907689,
          createdAt: "2024-08-25",
        },
        {
          facilityNumber: "FAC-015",
          customerName: "Drew Wilson",
          totalLoan: 25834560,
          totalClosedLoan: 1435371,
          totalActiveLoan: 24399189,
          totalInstallmentCib: 143407,
          createdAt: "2024-05-01",
        },
        {
          facilityNumber: "FAC-016",
          customerName: "Chris Moore",
          totalLoan: 16974836,
          totalClosedLoan: 3955750,
          totalActiveLoan: 13019086,
          totalInstallmentCib: 310204,
          createdAt: "2024-04-24",
        },
        {
          facilityNumber: "FAC-017",
          customerName: "Chris Smith",
          totalLoan: 19148893,
          totalClosedLoan: 2405341,
          totalActiveLoan: 16743552,
          totalInstallmentCib: 488462,
          createdAt: "2024-08-06",
        },
        {
          facilityNumber: "FAC-018",
          customerName: "Jamie Moore",
          totalLoan: 39848279,
          totalClosedLoan: 10490826,
          totalActiveLoan: 29357453,
          totalInstallmentCib: 686557,
          createdAt: "2024-10-09",
        },
        {
          facilityNumber: "FAC-019",
          customerName: "Taylor Clark",
          totalLoan: 31925283,
          totalClosedLoan: 7891423,
          totalActiveLoan: 24033860,
          totalInstallmentCib: 865189,
          createdAt: "2024-02-13",
        },
        {
          facilityNumber: "FAC-020",
          customerName: "Morgan Wilson",
          totalLoan: 39249023,
          totalClosedLoan: 4216332,
          totalActiveLoan: 35032691,
          totalInstallmentCib: 352949,
          createdAt: "2024-06-02",
        },
        {
          facilityNumber: "FAC-021",
          customerName: "Jane Brown",
          totalLoan: 16837044,
          totalClosedLoan: 2333338,
          totalActiveLoan: 14503706,
          totalInstallmentCib: 241396,
          createdAt: "2024-03-03",
        },
        {
          facilityNumber: "FAC-022",
          customerName: "Drew Moore",
          totalLoan: 46593131,
          totalClosedLoan: 324562,
          totalActiveLoan: 46268569,
          totalInstallmentCib: 549241,
          createdAt: "2024-11-16",
        },
        {
          facilityNumber: "FAC-023",
          customerName: "Alex Smith",
          totalLoan: 24001718,
          totalClosedLoan: 8960112,
          totalActiveLoan: 15041606,
          totalInstallmentCib: 237423,
          createdAt: "2024-11-03",
        },
        {
          facilityNumber: "FAC-024",
          customerName: "Morgan Davis",
          totalLoan: 36148895,
          totalClosedLoan: 13750565,
          totalActiveLoan: 22398330,
          totalInstallmentCib: 571261,
          createdAt: "2024-09-22",
        },
        {
          facilityNumber: "FAC-025",
          customerName: "Jamie Johnson",
          totalLoan: 13246003,
          totalClosedLoan: 6511022,
          totalActiveLoan: 6734981,
          totalInstallmentCib: 980913,
          createdAt: "2024-12-29",
        },
        {
          facilityNumber: "FAC-026",
          customerName: "Sam Brown",
          totalLoan: 19124832,
          totalClosedLoan: 8514587,
          totalActiveLoan: 10610245,
          totalInstallmentCib: 725535,
          createdAt: "2024-01-03",
        },
        {
          facilityNumber: "FAC-027",
          customerName: "Morgan Miller",
          totalLoan: 26856113,
          totalClosedLoan: 10640654,
          totalActiveLoan: 16215459,
          totalInstallmentCib: 549251,
          createdAt: "2024-12-28",
        },
        {
          facilityNumber: "FAC-028",
          customerName: "Morgan Clark",
          totalLoan: 41303296,
          totalClosedLoan: 1248187,
          totalActiveLoan: 40055109,
          totalInstallmentCib: 741707,
          createdAt: "2024-08-27",
        },
        {
          facilityNumber: "FAC-029",
          customerName: "Alex Smith",
          totalLoan: 44131196,
          totalClosedLoan: 2505184,
          totalActiveLoan: 41626012,
          totalInstallmentCib: 977751,
          createdAt: "2024-09-24",
        },
        {
          facilityNumber: "FAC-030",
          customerName: "Jane Lee",
          totalLoan: 17006253,
          totalClosedLoan: 7186838,
          totalActiveLoan: 9819415,
          totalInstallmentCib: 916923,
          createdAt: "2024-08-22",
        },
        {
          facilityNumber: "FAC-031",
          customerName: "Morgan Johnson",
          totalLoan: 22305118,
          totalClosedLoan: 4803098,
          totalActiveLoan: 17502020,
          totalInstallmentCib: 174054,
          createdAt: "2024-07-31",
        },
        {
          facilityNumber: "FAC-032",
          customerName: "Sam Moore",
          totalLoan: 33355565,
          totalClosedLoan: 12881976,
          totalActiveLoan: 20473589,
          totalInstallmentCib: 826886,
          createdAt: "2024-01-30",
        },
        {
          facilityNumber: "FAC-033",
          customerName: "Morgan Johnson",
          totalLoan: 25591151,
          totalClosedLoan: 560896,
          totalActiveLoan: 25030255,
          totalInstallmentCib: 140631,
          createdAt: "2024-01-20",
        },
        {
          facilityNumber: "FAC-034",
          customerName: "Drew Clark",
          totalLoan: 47628034,
          totalClosedLoan: 10278933,
          totalActiveLoan: 37349101,
          totalInstallmentCib: 545833,
          createdAt: "2024-05-17",
        },
        {
          facilityNumber: "FAC-035",
          customerName: "John Lee",
          totalLoan: 40304001,
          totalClosedLoan: 3437597,
          totalActiveLoan: 36866404,
          totalInstallmentCib: 807185,
          createdAt: "2024-08-19",
        },
      ]);
    }, 300);

    return () => clearTimeout(timeout);
  }, []);

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
            <TextField
              fullWidth
              label="Facility/LO Number"
              variant="standard"
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
                startIcon={<ClearIcon />}>
                Clear
              </Button>
              <Button
                variant="contained"
                color="primary"
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
              onClick={() => ""}>
              Export
            </Button>
          </Stack>
        </Stack>

        {!data ? (
          <Box sx={{ padding: 2 }}>
            <Skeleton />
            <Skeleton animation="wave" />
            <Skeleton animation={false} />
          </Box>
        ) : (
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
                {data.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{row.facilityNumber}</TableCell>
                    <TableCell>{row.customerName}</TableCell>
                    <TableCell>{formatCurrency(row.totalLoan)}</TableCell>
                    <TableCell>{formatCurrency(row.totalClosedLoan)}</TableCell>
                    <TableCell>{formatCurrency(row.totalActiveLoan)}</TableCell>
                    <TableCell>
                      {formatCurrency(row.totalInstallmentCib)}
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
                          to={`/cib-calculations/${row.facilityNumber}`}>
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
          rowsPerPage={100}
          page={0}
          count={data ? data.length : 0}
          onPageChange={() => {}}
          onRowsPerPageChange={(e) => console.log(e.target.value)}
          labelRowsPerPage="Page Size"
          labelDisplayedRows={() => ``}
          rowsPerPageOptions={[100, 200]}
        />
      </Paper>
    </Box>
  );
};

export default ListCIBCalculations;
