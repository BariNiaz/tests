import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Typography
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useEffect, useState } from "react";
import { getResults } from "../services/api";

export default function ResultsPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "admin") return;

    getResults()
      .then(setResults)
      .finally(() => setLoading(false));
  }, []);

  if (user?.role !== "admin") {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4">
          Результаты
        </Typography>

        <Typography sx={{ mt: 2 }}>
          У вас нет доступа к просмотру результатов других сотрудников.
        </Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" mb={4}>
        Результаты тестирования
      </Typography>

      <Grid container spacing={3}>
        {results.map((result) => {
          const percent = Math.round(result.score / result.total * 100);

          let color: "success" | "warning" | "error" = "error";

          if (percent >= 90) color = "success";
          else if (percent >= 70) color = "warning";

          return (
            <Grid size={{ xs: 12, md: 6 }} key={result.id}>
              <Card elevation={3}>
                <CardContent>

                  <Typography variant="h6">
                    {result.userName}
                  </Typography>

                  <Typography color="text.secondary">
                    {result.userEmail}
                  </Typography>

                  <Box mt={2} />

                  <Typography>
                    <b>Тест:</b> {result.testTitle}
                  </Typography>

                  <Typography>
                    <b>Уровень:</b> {result.difficulty}
                  </Typography>

                  <Typography>
                    <b>Результат:</b> {result.score} / {result.total}
                  </Typography>

                  <Typography>
                    <b>Дата:</b>{" "}
                    {new Date(result.completedAt).toLocaleString("ru-RU")}
                  </Typography>

                  <Box mt={2}>
                    <Chip
                      color={color}
                      label={`${percent}%`}
                    />
                  </Box>

                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}