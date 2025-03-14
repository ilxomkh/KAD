import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { XCircle, Eye, EyeOff } from "lucide-react";
import RoleDropdown from "./RoleDropdown";
import PositionDropdown from "./PositionDropdown";
import { BASE_URL } from "../utils/api";
import { useAuth } from "../context/AuthContext"; // Импортируем useAuth

const AddUsers = ({ onClose }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    role: "",
    login: "",
    password: "",
    passwordVerify: "",
    position: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Получаем актуальный токен из контекста
  const { token } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // Проверяем, что все поля, кроме role и position, заполнены
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.middleName.trim() ||
      !formData.login.trim() ||
      !formData.password ||
      !formData.passwordVerify
    ) {
      alert("Пожалуйста, заполните все обязательные поля.");
      return;
    }

    // Проверяем, что пароли совпадают
    if (formData.password !== formData.passwordVerify) {
      alert("Пароли не совпадают!");
      return;
    }

    // Формируем payload согласно ожиданиям бэкенда
    const payload = {
      username: formData.login,
      password: formData.password,
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      position: formData.position, // не проходит валидация
      active: true,
      role: formData.role, // не проходит валидация
      randomizerIndex: 0,
    };

    console.log("Отправляемые данные:", payload);

    try {
      const response = await fetch(`${BASE_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Ошибка при добавлении пользователя");

      const createdUser = await response.json();
      console.log("Создан пользователь:", createdUser);
      onClose();
      // При необходимости можно также обновить список пользователей или перейти на другую страницу
      // navigate("/users");
    } catch (error) {
      console.error("Ошибка сети:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/20 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-2xl w-1/3 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-black">
            Foydalanuvchi qo‘shish
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <XCircle size={24} className="stroke-1" />
          </button>
        </div>

        <div className="grid grid-cols-2 text-left gap-10">
          <div>
            <label className="block text-gray-700 font-medium">Ismi</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Ismini kiriting"
              className="w-full border border-[#f3f9f6] focus:outline-none rounded-xl p-2 py-3 mt-1 text-gray-700"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Familiyasi</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Familiyasini kiriting"
              className="w-full border border-[#f3f9f6] focus:outline-none rounded-xl p-2 py-3 mt-1 text-gray-700"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Sharifi</label>
            <input
              type="text"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              placeholder="Sharifini kiriting"
              className="w-full border border-[#f3f9f6] focus:outline-none rounded-xl p-2 py-3 mt-1 text-gray-700"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Logini</label>
            <input
              type="text"
              name="login"
              value={formData.login}
              onChange={handleChange}
              placeholder="Loginini kiriting"
              className="w-full border border-[#f3f9f6] focus:outline-none rounded-xl p-2 py-3 mt-1 text-gray-700"
            />
          </div>

          <RoleDropdown
            value={formData.role}
            onChange={(role) =>
              setFormData({ ...formData, role })
            }
            bgColor="bg-white"
            borderColor="border-[#f3f9f6]"
          />

          <div className="relative">
            <label className="block text-gray-700 font-medium">Paroli</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Parolini kiriting"
              className="w-full border border-[#f3f9f6] focus:outline-none rounded-xl p-2 py-3 mt-1 text-gray-700"
            />
            <button
              type="button"
              className="absolute right-3 top-10 text-gray-400 focus:outline-none hover:text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>

          <PositionDropdown
            value={formData.position}
            onChange={(position) =>
              setFormData({ ...formData, position })
            }
            bgColor="bg-white"
            borderColor="border-[#f3f9f6]"
          />

          <div className="relative">
            <label className="block text-gray-700 font-medium">Parolni tasdiqlang</label>
            <input
              type={showPassword ? "text" : "password"}
              name="passwordVerify"
              value={formData.passwordVerify}
              onChange={handleChange}
              placeholder="Parolini qaytadan kiriting"
              className="w-full border border-[#f3f9f6] focus:outline-none rounded-xl p-2 py-3 mt-1 text-gray-700"
            />
            <button
              type="button"
              className="absolute right-3 top-10 text-gray-400 focus:outline-none hover:text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>
        </div>

        <div className="relative mt-6">
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-500 focus:outline-none text-white py-3 rounded-xl text-lg font-semibold hover:bg-blue-600 transition"
          >
            Qo‘shish
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUsers;
