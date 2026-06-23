import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const NavigationBar = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <AppBar position="static">
      <Toolbar>

        {/* Левая часть */}
        <Button color="inherit" onClick={() => navigate("/dashboard")}>
          Тесты
        </Button>

        <Button color="inherit" onClick={() => navigate("/results")}>
          Результаты
        </Button>

        {user?.role === "admin" && (
          <Button color="inherit" onClick={() => navigate("/admin")}>
            Админ
          </Button>
        )}

        {/* Разделитель */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Правая часть */}
        {!user ? (
          <Button color="inherit" onClick={() => navigate("/")}>
            Войти
          </Button>
        ) : (
          <>
            <Button color="inherit">
              {user.name || "Пользователь"}
            </Button>

            <Button color="inherit" onClick={logout}>
              Выйти
            </Button>
          </>
        )}

      </Toolbar>
    </AppBar>
  );
};