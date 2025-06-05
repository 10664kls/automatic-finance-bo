import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import errorImg from "../../assets/error_500.svg";

const InternalErrorPage = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "70vh",
      }}>
      <Container maxWidth="md">
        <Grid container spacing={2}>
          <Grid size={6}>
            <Typography variant="h1">500</Typography>
            <Typography variant="h6">
              An unexpected error has occurred.
            </Typography>
            <Button sx={{ mt: 2 }} component={Link} to="/" variant="contained">
              Back Home
            </Button>
          </Grid>
          <Grid size={6}>
            <img src={errorImg} alt="" width={500} height={280} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default InternalErrorPage;
