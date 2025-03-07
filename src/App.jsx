import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Страницы
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

const RoleBasedRoutes = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }

    return (
        <Routes>
            {/* Авторизация */}
            <Route path="/login" element={<LoginPage />} />

            {/* Админская панель */}
            {user.role === "admin" && (
                <>
                    <Route path="/" element={<AdminPanel />} />
                </>
            )}

            {/* 1-я роль: Таблица + Сравнение */}
            {user.role === "geometry_fix" && (
                <>
                    <Route path="/" element={<Role1TablePage />} />
                    <Route path="/compare/:id" element={<ComparePage />} />
                </>
            )}

            {/* 2-я роль: Таблица + Проверка */}
            {user.role === "verify" && (
                <>
                    <Route path="/" element={<Role2TablePage />} />
                    <Route path="/check/:id" element={<CheckPage />} />
                </>
            )}

            {/* 3-я роль: Таблица + Агентская проверка */}
            {user.role === "agency" && (
                <>
                    <Route path="/" element={<Role3TablePage />} />
                    <Route path="/agency-review/:id" element={<AgencyReviewPage />} />
                </>
            )}

            {/* 4-я роль: Таблица + Вердикт */}
            {user.role === "verdict_79" && (
                <>
                    <Route path="/" element={<Role4TablePage />} />
                    <Route path="/verdict/:id" element={<VerdictPage />} />
                </>
            )}

            {/* Если путь не найден, редиректим на главную страницу */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <RoleBasedRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;
