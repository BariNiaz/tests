import { useState } from "react";
import { Container, TextField, Button, Typography } from "@mui/material";
import { loginUser, registerUser } from "../services/api";
// import { MenuItem, Select } from "@mui/material";
import { Navigate } from "react-router-dom";



export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  const login = async () => {
    const res = await loginUser({ email, password });
    localStorage.setItem("user", JSON.stringify(res));
    window.location.href = "/dashboard";
  };

  const register = async () => {
    await registerUser({
      full_name: name,
      email,
      password
    });

    alert("User created");
  };

  return (
    <Container>
      <Typography variant="h4">Login / Register</Typography>

      <TextField label="Name" fullWidth onChange={e => setName(e.target.value)} />
      <TextField label="Email" fullWidth onChange={e => setEmail(e.target.value)} />
      <TextField label="Password" type="password" fullWidth onChange={e => setPassword(e.target.value)} />

      <Button onClick={login} variant="contained" sx={{ mt: 2 }}>
        Login
      </Button>

      <Button onClick={register} variant="outlined" sx={{ mt: 2 }}>
        Register
      </Button>

    </Container>
  );
}