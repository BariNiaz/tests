import { Container, Card, CardContent, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { tests } from "../assets/mockTests";

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">Тесты</Typography>

      {tests.map((test) => (
        <Card key={test.id} sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6">
              {test.title}
            </Typography>

            <Typography>
              {test.description}
            </Typography>

            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() =>
                navigate(`/test/${test.id}`)
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