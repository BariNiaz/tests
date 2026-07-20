import { useState } from "react";
import { Container, TextField, Button, Typography, Alert } from "@mui/material";
import { Navigate } from "react-router-dom";
import { loginUser } from "../services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  const login = async () => {
    try {
      setError("");
      const res = await loginUser({ email, password });
      localStorage.setItem("user", JSON.stringify(res));
      const pendingToken = localStorage.getItem("pendingAccessToken");
      if (pendingToken) {
        localStorage.removeItem("pendingAccessToken");
        window.location.href = `/access/${pendingToken}`;
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Container sx={{ mt: 6, maxWidth: 480 }}>
      <Typography variant="h4">Вход</Typography>
      <Typography sx={{ mt: 1 }}>
        Входить должны только указанные в файле ща проверим.
      </Typography>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      <TextField
        label="Логин"
        fullWidth
        sx={{ mt: 2 }}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <TextField
        label="Пароль"
        type="password"
        fullWidth
        sx={{ mt: 2 }}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button onClick={login} variant="contained" sx={{ mt: 2 }}>
        Войти
      </Button>
    </Container>
  );
}
