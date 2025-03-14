// context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // При загрузке приложения берем данные из localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRefresh = localStorage.getItem("refreshToken");
    const storedRole = localStorage.getItem("role");

    if (storedToken && storedRefresh) {
      setToken(storedToken);
      setRefreshToken(storedRefresh);
      setRole(storedRole);
    }

    setIsLoading(false);
  }, []);

  // Автообновление refreshToken каждые 60 минут
  useEffect(() => {
    if (!refreshToken) return;

    const interval = setInterval(async () => {
      try {
        await refreshTokenRequest();
      } catch (error) {
        console.error("Ошибка обновления токена", error);
        if (error.response && error.response.status === 401) {
          logout();
        }
      }
    }, 60 * 60 * 1000); // 60 минут

    return () => clearInterval(interval);
  }, [refreshToken]);

  // Настраиваем axios interceptor
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          originalRequest.url.includes("/api/auth/login") ||
          originalRequest.url.includes("/api/auth/refresh")
        ) {
          return Promise.reject(error);
        }

        if (error.response && error.response.status === 401 && refreshToken) {
          try {
            await refreshTokenRequest();
            return axios(originalRequest);
          } catch (err) {
            console.error("Не удалось обновить токен", err);
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [refreshToken, token]);

  const setTokensAndUser = ({ token, refreshToken, role }) => {
    setToken(token);
    setRefreshToken(refreshToken);
    setRole(role);
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("role", role);
  };

  const refreshTokenRequest = async () => {
    if (!refreshToken) throw new Error("No refresh token available");

    try {
      const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {
        refreshToken,
      });
      const { token: newToken, refreshToken: newRefresh } = response.data;
      setTokensAndUser({ token: newToken, refreshToken: newRefresh, role });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        logout();
      }
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setRefreshToken(null);
    setRole(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        refreshToken,
        role,
        isLoading,
        setTokensAndUser,
        refreshTokenRequest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
