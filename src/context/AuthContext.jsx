import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Создаем контекст
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate(); // Используем useNavigate

    // Проверка авторизации при загрузке
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUser(storedUser);
        }
    }, []);

    // Функция входа
    const login = (role) => {
        const userData = { role };
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);

        // Делаем редирект после входа
        if (role === "admin") {
            navigate("/"); // Перенаправляем на админскую панель
        } else if (role === "1-role") {
            navigate("/");
        } else if (role === "2-role") {
            navigate("/");
        } else if (role === "3-role") {
            navigate("/");
        }
    };

    // Функция выхода
    const logout = () => {
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login"); // Перенаправляем на страницу логина
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Хук для использования контекста
export const useAuth = () => useContext(AuthContext);
