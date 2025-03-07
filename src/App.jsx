// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Импортируем страницы
import LoginPage from "./pages/LoginPage";
import Role1TablePage from "./pages/Role1TablePage";
import ComparePage from "./pages/ComparePage";
import Role2TablePage from "./pages/Role2TablePage";
import CheckPage from "./pages/CheckPage";
import Role3TablePage from "./pages/Role3TablePage";
import AgencyReviewPage from "./pages/AgencyReviewPage";
import AdminPanel from "./pages/AdminPanel";
import Role4TablePage from "./pages/Role4TablePage";
import VerdictPage from "./pages/Verdict";

const PrivateRoutes = () => {
  const { token, role, isLoading } = useAuth();

  // Пока идёт проверка, не делаем редирект
  if (isLoading) {
    return <div>Loading...</div>; 
    // Можно поставить здесь свой лоадер / спиннер
  }

  // Если токена нет — перенаправляем на логин
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Если токен есть, возвращаем нужные роуты
  return (
    <Routes>
      {role === "admin" && (
        <>
          <Route path="/" element={<AdminPanel />} />
        </>
      )}

      {role === "geometry_fix" && (
        <>
          <Route path="/" element={<Role1TablePage />} />
          <Route path="/compare/:id" element={<ComparePage />} />
        </>
      )}

      {role === "verify" && (
        <>
          <Route path="/" element={<Role2TablePage />} />
          <Route path="/check/:id" element={<CheckPage />} />
        </>
      )}

      {role === "agency" && (
        <>
          <Route path="/" element={<Role3TablePage />} />
          <Route path="/agency-review/:id" element={<AgencyReviewPage />} />
        </>
      )}

      {role === "verdict_79" && (
        <>
          <Route path="/" element={<Role4TablePage />} />
          <Route path="/verdict/:id" element={<VerdictPage />} />
        </>
      )}

      {/* Если роль неизвестна – просто редирект */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<PrivateRoutes />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
