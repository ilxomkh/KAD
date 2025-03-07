import { useState, useEffect } from "react";
import { XCircle, Eye, EyeOff } from "lucide-react";
import RoleDropdown from "./RoleDropdown";
import PositionDropdown from "./PositionDropdown";
import { BASE_URL } from "../utils/api";
import { useAuth } from "../context/AuthContext"; // Импортируем useAuth

const EditModal = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    role: "",
    username: "",
    password: "",
    passwordVerify: "",
    position: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  // Получаем актуальный токен из контекста
  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormData({
        firstName: item.firstName || "",
        lastName: item.lastName || "",
        middleName: item.middleName || "",
        role: item.role || "",
        username: item.username || "",
        password: item.password || "",
        passwordVerify: item.password || "",
        position: item.position || "",
      });
    }
  }, [item]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.passwordVerify) {
      alert("Пароли не совпадают!");
      return;
    }

    const userId = item?.id || item?._id || item?.ID;
    if (!userId) {
      console.error("Нет корректного идентификатора пользователя для обновления");
      return;
    }

    const payload = {
      username: formData.username,
      password: formData.password,
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      position: formData.position,
      active: item.active !== undefined ? item.active : true,
      role: formData.role || "geometry_fix",
      randomizerIndex: item.randomizerIndex || 0,
    };

    console.log("Отправляемые данные для обновления:", payload);

    try {
      const response = await fetch(`${BASE_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Ошибка при обновлении пользователя");
      }

      const updatedUser = await response.json();
      console.log("Обновлённый пользователь:", updatedUser);
      if (onSave) onSave(updatedUser);
      onClose();
    } catch (error) {
      console.error("Ошибка сети:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-50 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-2xl shadow-lg w-1/2 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-black">
            Ma‘lumotlarni tahrirlash
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
              className="w-full border border-[#94c6ff] rounded-xl p-2 py-3 mt-1 text-gray-700 bg-[#e8f3ff]/50"
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
              className="w-full border border-[#94c6ff] rounded-xl p-2 py-3 mt-1 text-gray-700 bg-[#e8f3ff]/50"
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
              className="w-full border border-[#94c6ff] rounded-xl p-2 py-3 mt-1 text-gray-700 bg-[#e8f3ff]/50"
            />
          </div>

          <RoleDropdown
            value={formData.role}
            onChange={(role) => setFormData({ ...formData, role })}
            bgColor="bg-[#e8f3ff]/50"
            borderColor="border-[#94c6ff]"
          />

          <div>
            <label className="block text-gray-700 font-medium">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username kiriting"
              className="w-full border border-[#94c6ff] rounded-xl p-2 py-3 mt-1 text-gray-700 bg-[#e8f3ff]/50"
            />
          </div>

          <div className="relative">
            <label className="block text-gray-700 font-medium">Paroli</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Parolini kiriting"
              className="w-full border border-[#94c6ff] rounded-xl p-2 py-3 mt-1 text-gray-700 bg-[#e8f3ff]/50"
            />
            <button
              type="button"
              className="absolute right-3 top-10 text-gray-400 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>

          <PositionDropdown
            value={formData.position}
            onChange={(position) => setFormData({ ...formData, position })}
            bgColor="bg-[#e8f3ff]/50"
            borderColor="border-[#94c6ff]"
          />

          <div className="relative">
            <label className="block text-gray-700 font-medium">
              Parolni tasdiqlang
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="passwordVerify"
              value={formData.passwordVerify}
              onChange={handleChange}
              placeholder="Parolini qaytadan kiriting"
              className="w-full border border-[#94c6ff] rounded-xl p-2 py-3 mt-1 text-gray-700 bg-[#e8f3ff]/50"
            />
            <button
              type="button"
              className="absolute right-3 top-10 text-gray-400 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>
        </div>

        <div className="relative mt-6">
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-500 text-white py-3 rounded-xl mt-6 text-lg font-semibold hover:bg-blue-600 transition"
          >
            Tahrirlash
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
