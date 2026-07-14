import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import TestPage from "./pages/TestPage";
import ResultsPage from "./pages/ResultsPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import AccessLinkPage from "./pages/AccessLinkPage";

import { NavigationBar } from "./components/navigation_bar";

function App() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <BrowserRouter>
      {user && <NavigationBar />}

      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={user ? <DashboardPage /> : <Navigate to="/" />}
        />

        <Route path="/access/:token" element={<AccessLinkPage />} />

        <Route path="/test/:id" element={<TestPage />} />

        <Route
          path="/results"
          element={user ? <ResultsPage /> : <Navigate to="/" />}
        />

        <Route
          path="/admin"
          element={
            user?.role === "admin" ? <AdminPanelPage /> : <Navigate to="/" />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;