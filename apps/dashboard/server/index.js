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
  }
];

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

app.listen(3001, () => {
  console.log("Server running on port 3001");
});