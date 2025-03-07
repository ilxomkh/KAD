import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
    const { login } = useAuth();
    const [role, setRole] = useState("");

    const handleLogin = () => {
        if (role) {
            login(role);
        } else {
            alert("Выберите роль перед входом!");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h1 className="text-2xl font-semibold mb-4 text-center">Вход в систему</h1>

                <label className="block mb-2 text-gray-700">Выберите вашу роль:</label>
                <select
                    className="w-full px-3 py-2 border rounded-lg outline-none"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                >
                    <option value="">-- Выберите роль --</option>
                    <option value="admin">Администратор</option>
                    <option value="geometry_fix">1-я роль (Таблица + Сравнение)</option>
                    <option value="verify">2-я роль (Таблица + Проверка)</option>
                    <option value="agency">3-я роль (Агентство)</option>
                    <option value="verdict_79">4-я роль </option>
                </select>

                <button
                    className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                    onClick={handleLogin}
                >
                    Войти
                </button>
            </div>
        </div>
    );
};

export default LoginPage;