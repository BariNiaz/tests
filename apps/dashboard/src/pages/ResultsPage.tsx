import { Container, Typography } from "@mui/material";

export default function ResultsPage() {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">Результаты</Typography>
      <Typography sx={{ mt: 2 }}>
        Результаты и сброс попыток доступны администратору в админ-панели.
      </Typography>
    </Container>
  );
}
