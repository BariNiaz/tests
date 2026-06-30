import { Container, Card, CardContent, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserTests } from "../services/api";

export default function DashboardPage() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [tests, setTests] = useState<any[]>([]);

  useEffect(() => {
    async function loadTests() {
      const data = await getUserTests(user.id);
      setTests(data);
    }

    loadTests();
  }, [user.id]);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">Тесты</Typography>

      {tests.length === 0 && (
        <Typography sx={{ mt: 2 }}>
          Вам пока не назначены тесты.
        </Typography>
      )}

      {tests.map((test) => (
        <Card key={test.id} sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6">
              {test.title}
            </Typography>

            <Typography>
              {test.description}
            </Typography>

            <Typography>
              Количество вопросов: {test.questions.length}
            </Typography>

            <Typography>
              Время: {test.timeLimit} секунд
            </Typography>

            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() =>
                navigate(`/test/${test.id}`, {
                  state: test
                })
              }
            >
              Начать тест
            </Button>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
}
