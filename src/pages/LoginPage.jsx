import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/api";
import { User, Lock } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setTokensAndUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    try {
      setErrorMsg("");
      setLoading(true);
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        username,
        password,
      });
      const { token, refreshToken } = response.data;
      const role = response.data.role || "admin";
      setTokensAndUser({ token, refreshToken, role });
      navigate("/");
    } catch (error) {
      console.error(error);
      setErrorMsg("Ошибка входа. Проверьте логин/пароль.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-screen h-screen bg-[#e4ebf3] overflow-hidden">
      {/* Левая часть с картинкой */}
      <div className="hidden lg:block w-1/2 h-full">
        <img
          src="src/assets/Left Side.png"
          alt="Left Side"
          className="w-full h-full p-4 "
        />
      </div>

      {/* Правая часть с формой */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 bg-[#e4ebf3]">
        <div className="max-w-lg w-full bg-white p-6 rounded-2xl">
          <div className="flex flex-col">
            <img
              src="/assets/Blue.svg"
              alt="ZBEKOSMOS"
              className="h-16 my-8 w-auto"
            />
            <p className="text-3xl cursor-default font-bold mb-4 text-center">
              Etirof'ga xush kelibsiz!
            </p>
            <p className="text-gray-600 mb-6 cursor-default text-center">
              Davom etish uchun login va parolingizni kiriting.
            </p>
            {errorMsg && (
              <div className="text-red-500 text-center mb-4">{errorMsg}</div>
            )}

            <div className="px-10 mb-8">
              {/* Поле логина */}
              <div className="relative mb-4">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-3 border border-[#F3F6F9] rounded-xl outline-none focus:border-blue-400 transition-colors"
                  placeholder="Loginni kiriting"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              {/* Поле пароля */}
              <div className="relative mb-4">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  className="w-full pl-10 pr-3 py-3 border border-[#F3F6F9] rounded-xl outline-none focus:border-blue-400 transition-colors"
                  placeholder="Parolni kiriting"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Кнопка входа */}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full cursor-pointer bg-[#1683FF] text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                {loading ? "Vxod..." : "Kirish"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
