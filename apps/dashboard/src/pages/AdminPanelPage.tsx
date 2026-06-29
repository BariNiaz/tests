import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  FormControlLabel,
  MenuItem,
  TextField,
  Typography
} from "@mui/material";

import { useEffect, useState } from "react";

import {
  assignTests,
  getCategories,
  getUsers,
  saveTests
} from "../services/api";

export default function AdminPanelPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const [questionsLimit, setQuestionsLimit] = useState("1");
  const [timeLimit, setTimeLimit] = useState("60");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const usersData = await getUsers();
    const categoriesData = await getCategories();

    setUsers(usersData);
    setCategories(categoriesData);
  }

  function parseCsv(text: string) {
    const rows = text
      .split("\n")
      .map((row) => row.trim())
      .filter(Boolean);

    const testsMap: any = {};

    rows.slice(1).forEach((row, index) => {
      const [
        category,
        questionText,
        optionsText,
        correctText,
        type
      ] = row.split(";");

      if (!category || !questionText || !optionsText || !correctText) {
        return;
      }

      if (!testsMap[category]) {
        testsMap[category] = {
          id: Object.keys(testsMap).length + 1,
          title: category,
          description: `Категория: ${category}`,
          questions: []
        };
      }

      testsMap[category].questions.push({
        id: index + 1,
        text: questionText,
        type: type || "single",
        options: optionsText.split("|"),
        correct: correctText.split(",").map(Number)
      });
    });

    return Object.values(testsMap);
  }

  async function uploadCsv(event: any) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const text = await file.text();
    const parsedTests = parseCsv(text);

    await saveTests(parsedTests);
    await loadData();

    alert("CSV файл загружен");
  }

  function toggleCategory(categoryId: number) {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(
        selectedCategories.filter((id) => id !== categoryId)
      );
    } else {
      setSelectedCategories([
        ...selectedCategories,
        categoryId
      ]);
    }
  }

  async function assign() {
    if (!selectedUser) {
      alert("Выберите пользователя");
      return;
    }

    if (selectedCategories.length === 0) {
      alert("Выберите хотя бы одну категорию");
      return;
    }

    await assignTests({
      userId: selectedUser,
      testIds: selectedCategories,
      questionsLimit,
      timeLimit
    });

    alert("Категории назначены пользователю");
  }

  if (user.role !== "admin") {
    return <Typography>Нет доступа</Typography>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">Админ панель</Typography>
      <Typography>Здесь будут пользователи и тесты</Typography>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6">
            1. Загрузить CSV файл с вопросами
          </Typography>

          <Button
            variant="contained"
            component="label"
            sx={{ mt: 2 }}
          >
            Выбрать CSV файл
            <input
              hidden
              type="file"
              accept=".csv"
              onChange={uploadCsv}
            />
          </Button>

          <Typography sx={{ mt: 2 }}>
            Формат CSV:
          </Typography>

          <Typography>
            категория;вопрос;варианты;правильный;тип
          </Typography>

          <Typography>
            Охрана труда;Нужна ли каска?;Да|Нет;0;single
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6">
            2. Назначить категории пользователю
          </Typography>

          <TextField
            select
            fullWidth
            label="Пользователь"
            sx={{ mt: 2 }}
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            {users
              .filter((currentUser) => currentUser.role === "worker")
              .map((currentUser) => (
                <MenuItem key={currentUser.id} value={currentUser.id}>
                  {currentUser.full_name} — {currentUser.email}
                </MenuItem>
              ))}
          </TextField>

          <Typography sx={{ mt: 2 }}>
            Категории:
          </Typography>

          {categories.length === 0 && (
            <Typography sx={{ mt: 1 }}>
              Сначала загрузите CSV файл.
            </Typography>
          )}

          {categories.map((category) => (
            <FormControlLabel
              key={category.id}
              control={
                <Checkbox
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                />
              }
              label={`${category.title} — вопросов: ${category.questionsCount}`}
            />
          ))}

          <TextField
            fullWidth
            type="number"
            label="Сколько вопросов дать пользователю"
            sx={{ mt: 2 }}
            value={questionsLimit}
            onChange={(e) => setQuestionsLimit(e.target.value)}
          />

          <TextField
            fullWidth
            type="number"
            label="Время на тест в секундах"
            sx={{ mt: 2 }}
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)}
          />

          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={assign}
          >
            Назначить
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
