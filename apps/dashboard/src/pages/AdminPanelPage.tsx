import {
  Alert,
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
  createTest,
  createUser,
  getCategories,
  getResults,
  getUsers,
  resetAttempt
} from "../services/api";

const difficultyLabels: Record<string, string> = {
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  lead: "Lead"
};

const defaultQuestionsJson = JSON.stringify(
  [
    {
      id: 1,
      text: "Вопрос 1",
      options: ["Ответ A", "Ответ B", "Ответ C", "Ответ D"],
      correct: [0]
    }
  ],
  null,
  2
);

export default function AdminPanelPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const [questionsLimit, setQuestionsLimit] = useState("1");
  const [timeLimit, setTimeLimit] = useState("60");

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("worker");

  const [testTitle, setTestTitle] = useState("");
  const [testDescription, setTestDescription] = useState("");
  const [testDifficulty, setTestDifficulty] = useState("junior");
  const [testQuestions, setTestQuestions] = useState(defaultQuestionsJson);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const usersData = await getUsers();
    const categoriesData = await getCategories();
    const resultsData = await getResults();

    setUsers(usersData);
    setCategories(categoriesData);
    setResults(resultsData);
  }

  function showMessage(text: string) {
    setError("");
    setMessage(text);
  }

  function showError(text: string) {
    setMessage("");
    setError(text);
  }

  function toggleCategory(categoryId: number) {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  }

  async function addUser() {
    try {
      await createUser({
        full_name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole
      });

      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("worker");
      await loadData();
      showMessage("Пользователь добавлен в server/data/users.json");
    } catch (err: any) {
      showError(err.message);
    }
  }

  async function addTest() {
    try {
      const questions = JSON.parse(testQuestions);

      if (!Array.isArray(questions)) {
        showError("Вопросы должны быть массивом JSON");
        return;
      }

      await createTest({
        title: testTitle,
        description: testDescription,
        difficulty: testDifficulty,
        questions
      });

      setTestTitle("");
      setTestDescription("");
      setTestDifficulty("junior");
      setTestQuestions(defaultQuestionsJson);
      await loadData();
      showMessage("Тест добавлен в server/data/questions.json");
    } catch (err: any) {
      showError(err.message);
    }
  }

  async function assign() {
    if (!selectedUser) {
      showError("Выберите пользователя");
      return;
    }

    if (selectedCategories.length === 0) {
      showError("Выберите хотя бы один тест");
      return;
    }

    try {
      await assignTests({
        userId: selectedUser,
        testIds: selectedCategories,
        questionsLimit,
        timeLimit
      });

      await loadData();
      showMessage("Тесты назначены пользователю");
    } catch (err: any) {
      showError(err.message);
    }
  }

  async function reset(userId: number, testId: number) {
    try {
      await resetAttempt(userId, testId);
      await loadData();
      showMessage("Попытка сброшена. Пользователь может пройти тест заново.");
    } catch (err: any) {
      showError(err.message);
    }
  }

  if (user.role !== "admin") {
    return <Typography>Нет доступа</Typography>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">Админ панель</Typography>
      <Typography>
        Пользователи, тесты, назначения и результаты хранятся в JSON-файлах в server/data.
      </Typography>

      {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6">1. Добавить пользователя в базу</Typography>
          <Typography sx={{ mt: 1 }}>
            Регистрации на сайте нет, поэтому новых пользователей добавляет администратор.
          </Typography>

          <TextField fullWidth label="ФИО" sx={{ mt: 2 }} value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
          <TextField fullWidth label="Email" sx={{ mt: 2 }} value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
          <TextField fullWidth label="Пароль" type="password" sx={{ mt: 2 }} value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} />
          <TextField select fullWidth label="Роль" sx={{ mt: 2 }} value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)}>
            <MenuItem value="worker">Пользователь</MenuItem>
            <MenuItem value="admin">Администратор</MenuItem>
          </TextField>

          <Button variant="contained" sx={{ mt: 2 }} onClick={addUser}>
            Добавить пользователя
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6">2. Добавить тест</Typography>
          <Typography sx={{ mt: 1 }}>
            Загрузки файла через интерфейс нет. После добавления тест сохраняется в server/data/questions.json.
          </Typography>
          <Typography sx={{ mt: 1 }}>
            Формат вопроса: text, options, correct. В correct указываются индексы правильных ответов, начиная с 0.
          </Typography>

          <TextField fullWidth label="Название теста" sx={{ mt: 2 }} value={testTitle} onChange={(e) => setTestTitle(e.target.value)} />
          <TextField fullWidth label="Описание" sx={{ mt: 2 }} value={testDescription} onChange={(e) => setTestDescription(e.target.value)} />
          <TextField select fullWidth label="Уровень сложности" sx={{ mt: 2 }} value={testDifficulty} onChange={(e) => setTestDifficulty(e.target.value)}>
            <MenuItem value="junior">Junior</MenuItem>
            <MenuItem value="middle">Middle</MenuItem>
            <MenuItem value="senior">Senior</MenuItem>
            <MenuItem value="lead">Lead</MenuItem>
          </TextField>
          <TextField
            fullWidth
            multiline
            minRows={8}
            label="Вопросы в JSON"
            sx={{ mt: 2 }}
            value={testQuestions}
            onChange={(e) => setTestQuestions(e.target.value)}
          />

          <Button variant="contained" sx={{ mt: 2 }} onClick={addTest}>
            Добавить тест
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6">3. Назначить тест пользователю</Typography>

          <TextField select fullWidth label="Пользователь" sx={{ mt: 2 }} value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
            {users.filter((currentUser) => currentUser.role === "worker").map((currentUser) => (
              <MenuItem key={currentUser.id} value={currentUser.id}>
                {currentUser.full_name} — {currentUser.email}
              </MenuItem>
            ))}
          </TextField>

          <Typography sx={{ mt: 2 }}>Тесты:</Typography>

          {categories.length === 0 && <Typography sx={{ mt: 1 }}>В server/data/questions.json пока нет тестов.</Typography>}

          {categories.map((category) => (
            <div key={category.id}>
              <FormControlLabel
                control={<Checkbox checked={selectedCategories.includes(category.id)} onChange={() => toggleCategory(category.id)} />}
                label={`${category.title} — ${difficultyLabels[category.difficulty] || category.difficulty} — вопросов: ${category.questionsCount}`}
              />
            </div>
          ))}

          <TextField fullWidth type="number" label="Сколько вопросов дать пользователю" sx={{ mt: 2 }} value={questionsLimit} onChange={(e) => setQuestionsLimit(e.target.value)} />
          <TextField fullWidth type="number" label="Время на тест в секундах" sx={{ mt: 2 }} value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />

          <Button variant="contained" sx={{ mt: 2 }} onClick={assign}>
            Назначить
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3, mb: 4 }}>
        <CardContent>
          <Typography variant="h6">4. Результаты и сброс попыток</Typography>

          {results.length === 0 && <Typography sx={{ mt: 1 }}>Пока нет прохождений.</Typography>}

          {results.map((result) => (
            <Card key={result.id} variant="outlined" sx={{ mt: 2 }}>
              <CardContent>
                <Typography>
                  {result.userName} — {result.testTitle} — {result.score}/{result.total}
                </Typography>
                <Typography>
                  Уровень: {difficultyLabels[result.difficulty] || result.difficulty}
                </Typography>
                <Typography>
                  Дата: {new Date(result.completedAt).toLocaleString()}
                </Typography>
                <Button variant="outlined" sx={{ mt: 1 }} onClick={() => reset(result.userId, result.testId)}>
                  Сбросить прохождение
                </Button>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </Container>
  );
}
