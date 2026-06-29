const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// временная "база"
// изменение
const users = [
  {
    id: 1,
    full_name: "Администратор",
    email: "admin@test.com",
    password_hash: bcrypt.hashSync("admin123", 10),
    role: "admin"
  },
  {
    id: 2,
    full_name: "Тестируемый",
    email: "worker@test.com",
    password_hash: bcrypt.hashSync("worker123", 10),
    role: "worker"
  },
  // второй тестируемый пользователь
  {
    id: 3,
    full_name: "Тестируемый 2",
    email: "worker2@test.com",
    password_hash: bcrypt.hashSync("worker123", 10),
    role: "worker"
  }
];

// временно храним загруженные из CSV тесты и назначения в памяти сервера
let tests = [];
let assignments = [];

// регистрация
app.post("/register", async (req, res) => {
  const { full_name, email, password, role } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const user = {
    id: Date.now(),
    full_name,
    email,
    password_hash: hash,
    role: role || "worker"
  };

  users.push(user);

  res.json({ message: "user created" });
});

// логин
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({
      error: "Пользователь не найден"
    });
  }

  const valid = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!valid) {
    return res.status(401).json({
      error: "Неверный пароль"
    });
  }

  res.json({
    id: user.id,
    name: user.full_name,
    role: user.role,
    email: user.email
  });
});

// получить список пользователей для администратора
app.get("/users", (req, res) => {
  const safeUsers = users.map(user => ({
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role
  }));

  res.json(safeUsers);
});

// сохранить тесты, которые администратор загрузил из CSV файла
app.post("/tests", (req, res) => {
  tests = req.body.tests || [];

  // при новой загрузке CSV старые назначения очищаются,
  // чтобы пользователь не получил тесты из старого файла
  assignments = [];

  res.json({
    message: "Тесты загружены",
    count: tests.length
  });
});

// получить категории после загрузки CSV файла
app.get("/categories", (req, res) => {
  const categories = tests.map(test => ({
    id: test.id,
    title: test.title,
    questionsCount: test.questions.length
  }));

  res.json(categories);
});

// назначить пользователю одну или несколько категорий
app.post("/assignments", (req, res) => {
  const {
    userId,
    testIds,
    questionsLimit,
    timeLimit
  } = req.body;

  if (!userId || !Array.isArray(testIds)) {
    return res.status(400).json({
      error: "Нужно передать userId и массив testIds"
    });
  }

  testIds.forEach(testId => {
    assignments.push({
      id: Date.now() + Math.random(),
      userId: Number(userId),
      testId: Number(testId),
      questionsLimit: Number(questionsLimit),
      timeLimit: Number(timeLimit)
    });
  });

  res.json({
    message: "Категории назначены"
  });
});

// получить назначенные тесты конкретного пользователя
app.get("/tests/user/:userId", (req, res) => {
  const userId = Number(req.params.userId);

  const userAssignments = assignments.filter(
    assignment => assignment.userId === userId
  );

  const result = userAssignments
    .map(assignment => {
      const test = tests.find(
        test => test.id === assignment.testId
      );

      if (!test) {
        return null;
      }

      return {
        ...test,
        questions: test.questions.slice(
          0,
          assignment.questionsLimit
        ),
        timeLimit: assignment.timeLimit
      };
    })
    .filter(Boolean);

  res.json(result);
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
