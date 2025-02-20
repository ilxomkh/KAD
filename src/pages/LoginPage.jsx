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
                    <option value="1-role">1-я роль (Таблица + Сравнение)</option>
                    <option value="2-role">2-я роль (Таблица + Проверка)</option>
                    <option value="3-role">3-я роль (Агентство)</option>
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


// import { useState } from "react";
// import { useAuth } from "../context/AuthContext";

// const LoginPage = () => {
// const { login } = useAuth();
// const [username, setUsername] = useState("");
// const [password, setPassword] = useState("");
// const [loading, setLoading] = useState(false);
// const [error, setError] = useState("");

// const handleLogin = async () => {
// setError("");
// setLoading(true);

// try {
// const response = await fetch("https://your-backend-api.com/auth/login", {
// method: "POST",
// headers: {
// "Content-Type": "application/json",
// },
// body: JSON.stringify({ username, password }),
// });

// const data = await response.json();

// if (response.ok) {
// login(data); // Передаем полученные данные (включая role) в контекст
// } else {
// setError(data.message || "Ошибка входа");
// }
// } catch (err) {
// setError("Ошибка сети, попробуйте снова");
// } finally {
// setLoading(false);
// }
// };

// return (
// <div className="flex items-center w-screen justify-center min-h-screen bg-gray-100">
// <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
// <h2 className="text-2xl font-semibold mb-4 text-center">Tizimga kirish</h2>

// {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

// <label className="block text-gray-700">Login:</label>
// <input
// type="text"
// className="w-full px-4 py-3 border border-[#F3F6F9] rounded-lg outline-none focus:outline-none mb-3"
// value={username}
// onChange={(e) => setUsername(e.target.value)}
// />

// <label className="block text-gray-700">Parol:</label>
// <input
// type="password"
// className="w-full px-4 py-3 border border-[#F3F6F9] rounded-lg outline-none focus:outline-none mb-3"
// value={password}
// onChange={(e) => setPassword(e.target.value)}
// />

// <button
// className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
// onClick={handleLogin}
// disabled={loading}
// >
// {loading ? "Вход..." : "Войти"}
// </button>
// </div>
// </div>
// );
// };

// export default LoginPage;