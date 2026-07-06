const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const TESTS_FILE = path.join(DATA_DIR, "questions.json");
const ASSIGNMENTS_FILE = path.join(DATA_DIR, "assigment.json");
const RESULTS_FILE = path.join(DATA_DIR, "results.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson(filePath, fallback) {
  ensureDataDir();

  if (!fs.existsSync(filePath)) {
    writeJson(filePath, fallback);
    return fallback;
  }

  const raw = fs.readFileSync(filePath, "utf-8").trim();

  if (!raw) {
    writeJson(filePath, fallback);
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Ошибка чтения ${filePath}:`, error);
    return fallback;
  }
}

function writeJson(filePath, data) {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function getUsers() {
  return readJson(USERS_FILE, []);
}

function saveUsers(users) {
  writeJson(USERS_FILE, users);
}

function getTests() {
  return readJson(TESTS_FILE, []);
}

function saveTests(tests) {
  writeJson(TESTS_FILE, tests);
}

function getAssignments() {
  return readJson(ASSIGNMENTS_FILE, []);
}

function saveAssignments(assignments) {
  writeJson(ASSIGNMENTS_FILE, assignments);
}

function getResults() {
  return readJson(RESULTS_FILE, []);
}

function saveResults(results) {
  writeJson(RESULTS_FILE, results);
}

function sanitizeUser(user) {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role
  };
}

function normalizeDifficulty(difficulty) {
  const allowed = ["junior", "middle", "senior", "lead"];
  return allowed.includes(difficulty) ? difficulty : "junior";
}

function normalizeQuestion(question, index) {
  const correct = Array.isArray(question.correct)
    ? question.correct.map(Number).filter(item => !Number.isNaN(item))
    : [];

  return {
    id: Number(question.id) || index + 1,
    text: String(question.text || question.question || "").trim(),
    type: correct.length > 1 ? "multiple" : "single",
    options: Array.isArray(question.options)
      ? question.options.map(item => String(item)).filter(Boolean)
      : [question.optionA, question.optionB, question.optionC, question.optionD, question.optionE, question.optionF]
          .filter(Boolean)
          .map(item => String(item)),
    correct
  };
}

function normalizeTest(test) {
  const questions = Array.isArray(test.questions)
    ? test.questions.map(normalizeQuestion).filter(question => question.text && question.options.length && question.correct.length)
    : [];

  return {
    id: Number(test.id) || Date.now(),
    title: String(test.title || "").trim(),
    description: String(test.description || "").trim(),
    difficulty: normalizeDifficulty(test.difficulty),
    questions
  };
}

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUsers().find(currentUser => currentUser.email === email);

  if (!user) {
    return res.status(401).json({ error: "Пользователь не найден в базе" });
  }

  const valid = String(password) === String(user.password_hash);

  if (!valid) {
    return res.status(401).json({ error: "Неверный пароль" });
  }

  res.json(sanitizeUser(user));
});

app.get("/users", (req, res) => {
  res.json(getUsers().map(sanitizeUser));
});

app.post("/users", (req, res) => {
  const { full_name, email, password, role } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ error: "Укажите имя, email и пароль" });
  }

  const users = getUsers();

  if (users.some(user => user.email === email)) {
    return res.status(400).json({ error: "Пользователь с таким email уже есть" });
  }

  const user = {
    id: Date.now(),
    full_name: String(full_name).trim(),
    email: String(email).trim(),
    password_hash: String(password),
    role: role === "admin" ? "admin" : "worker"
  };

  users.push(user);
  saveUsers(users);

  res.json(sanitizeUser(user));
});

app.get("/categories", (req, res) => {
  const categories = getTests().map(test => ({
    id: test.id,
    title: test.title,
    description: test.description,
    difficulty: test.difficulty,
    questionsCount: Array.isArray(test.questions) ? test.questions.length : 0
  }));

  res.json(categories);
});

app.post("/tests", (req, res) => {
  const tests = getTests();
  const test = normalizeTest({ ...req.body, id: Date.now() });

  if (!test.title) {
    return res.status(400).json({ error: "Укажите название теста" });
  }

  if (!test.questions.length) {
    return res.status(400).json({ error: "Добавьте вопросы теста" });
  }

  tests.push(test);
  saveTests(tests);

  res.json(test);
});

app.get("/tests/:testId", (req, res) => {
  const testId = Number(req.params.testId);
  const test = getTests().find(currentTest => Number(currentTest.id) === testId);

  if (!test) {
    return res.status(404).json({ error: "Тест не найден" });
  }

  res.json(test);
});

app.post("/assignments", (req, res) => {
  const { userId, testIds, questionsLimit, timeLimit } = req.body;

  if (!userId || !Array.isArray(testIds)) {
    return res.status(400).json({ error: "Нужно передать userId и массив testIds" });
  }

  const assignments = getAssignments();

  testIds.forEach(testId => {
    const existing = assignments.find(
      assignment =>
        Number(assignment.userId) === Number(userId) &&
        Number(assignment.testId) === Number(testId)
    );

    if (existing) {
      existing.questionsLimit = Number(questionsLimit);
      existing.timeLimit = Number(timeLimit);
      return;
    }

    assignments.push({
      id: Date.now() + Math.random(),
      userId: Number(userId),
      testId: Number(testId),
      questionsLimit: Number(questionsLimit) || 0,
      timeLimit: Number(timeLimit) || 60
    });
  });

  saveAssignments(assignments);
  res.json({ message: "Тесты назначены" });
});

app.get("/tests/user/:userId", (req, res) => {
  const userId = Number(req.params.userId);
  const assignments = getAssignments().filter(assignment => Number(assignment.userId) === userId);
  const tests = getTests();
  const results = getResults();

  const result = assignments
    .map(assignment => {
      const test = tests.find(currentTest => Number(currentTest.id) === Number(assignment.testId));

      if (!test) {
        return null;
      }

      const attempt = results.find(
        item => Number(item.userId) === userId && Number(item.testId) === Number(test.id)
      );
      const questions = Array.isArray(test.questions) ? test.questions : [];

      return {
        ...test,
        questions: questions.slice(0, assignment.questionsLimit || questions.length),
        timeLimit: assignment.timeLimit,
        completed: Boolean(attempt),
        score: attempt?.score,
        total: attempt?.total,
        completedAt: attempt?.completedAt
      };
    })
    .filter(Boolean);

  res.json(result);
});

app.post("/results", (req, res) => {
  const { userId, testId, answers } = req.body;
  const numericUserId = Number(userId);
  const numericTestId = Number(testId);
  const results = getResults();

  const alreadyPassed = results.find(
    result => Number(result.userId) === numericUserId && Number(result.testId) === numericTestId
  );

  if (alreadyPassed) {
    return res.status(403).json({ error: "Тест уже пройден. Доступна только одна попытка." });
  }

  const assignment = getAssignments().find(
    item => Number(item.userId) === numericUserId && Number(item.testId) === numericTestId
  );

  if (!assignment) {
    return res.status(403).json({ error: "Тест не назначен пользователю" });
  }

  const test = getTests().find(currentTest => Number(currentTest.id) === numericTestId);

  if (!test) {
    return res.status(404).json({ error: "Тест не найден" });
  }

  const questions = (test.questions || []).slice(0, assignment.questionsLimit || test.questions.length);
  let score = 0;

  questions.forEach(question => {
    const userAnswer = answers?.[question.id];

    if (question.type === "single" && Number(userAnswer) === Number(question.correct[0])) {
      score++;
    }

    if (question.type === "multiple") {
      const sortedUser = [...(userAnswer || [])].map(Number).sort();
      const sortedCorrect = [...question.correct].map(Number).sort();

      if (JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect)) {
        score++;
      }
    }
  });

  const result = {
    id: Date.now(),
    userId: numericUserId,
    testId: numericTestId,
    testTitle: test.title,
    difficulty: test.difficulty,
    answers: answers || {},
    score,
    total: questions.length,
    completedAt: new Date().toISOString()
  };

  results.push(result);
  saveResults(results);

  res.json(result);
});

app.get("/results", (req, res) => {
  const users = getUsers();
  const results = getResults().map(result => {
    const user = users.find(currentUser => Number(currentUser.id) === Number(result.userId));

    return {
      ...result,
      userName: user?.full_name || "Пользователь не найден",
      userEmail: user?.email || ""
    };
  });

  res.json(results);
});

app.delete("/results/:userId/:testId", (req, res) => {
  const userId = Number(req.params.userId);
  const testId = Number(req.params.testId);
  const results = getResults();
  const nextResults = results.filter(
    result => !(Number(result.userId) === userId && Number(result.testId) === testId)
  );

  saveResults(nextResults);
  res.json({ message: "Попытка сброшена" });
});

app.listen(3001, () => {
  ensureDataDir();
  readJson(USERS_FILE, []);
  readJson(TESTS_FILE, []);
  readJson(ASSIGNMENTS_FILE, []);
  readJson(RESULTS_FILE, []);
  console.log("Server running on port 3001");
});