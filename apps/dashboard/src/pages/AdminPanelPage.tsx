import { Container, Typography } from "@mui/material";

export default function AdminPanelPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (user.role !== "admin") {
    return <Typography>Нет доступа</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4">Админ панель</Typography>
      <Typography>Здесь будут пользователи и тесты</Typography>
    </Container>
  );
}