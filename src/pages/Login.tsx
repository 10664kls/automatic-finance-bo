import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Theme,
  Alert,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/Auth";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { login, isError, profile } = useAuth();

  useEffect(() => {
    if (profile) {
      navigate("/");
    }
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await login({ email, password });
  };

  return (
    <Box
      sx={(them: Theme) => ({
        padding: "2rem",
        maxWidth: "460px",
        margin: "auto",
        marginTop: "10vh",
        border: "1px solid #eee",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
        borderRadius: `calc(${them.shape.borderRadius}px * 2)`,
        [them.breakpoints.down("sm")]: {
          background: "none",
          border: "none",
          boxShadow: "none",
        },
      })}>
      <Stack spacing={2} useFlexGap component={"form"} onSubmit={handleSubmit}>
        <Typography variant="h1" sx={{ fontWeight: 450, fontSize: "1.8rem" }}>
          Login to Automatic Finance
        </Typography>

        {isError && (
          <Alert sx={{ display: "flex", width: "100%", p: 1 }} severity="error">
            Your username or password is incorrect
          </Alert>
        )}
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          type="email"
          name="email"
          value={email}
          autoFocus
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          value={password}
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" fullWidth variant="contained" color="primary">
          Login
        </Button>

        <Typography
          component="div"
          variant="body2"
          sx={{ textAlign: "center" }}>
          Don&apos;t have an account?{" "}
          <span>Please contact your administrator</span>
        </Typography>
      </Stack>
    </Box>
  );
};

export default Login;
