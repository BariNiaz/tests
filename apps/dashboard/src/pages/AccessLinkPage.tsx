import { Alert, CircularProgress, Container } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resolveAccessLink } from "../services/api";

export default function AccessLinkPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    resolveAccessLink(token)
      .then((test) => navigate(`/test/${test.id}`, { state: test, replace: true }))
      .catch((err) => setError(err.message));
  }, [token, navigate]);

  return (
    <Container sx={{ mt: 6 }}>
      {error ? <Alert severity="error">{error}</Alert> : <CircularProgress />}
    </Container>
  );
}
