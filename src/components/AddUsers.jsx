import { useState } from "react";
import { X, Eye, EyeOff, XCircle } from "lucide-react";
import RoleDropdown from "./RoleDropdown";
import PositionDropdown from "./PositionDropdown";

const AddUsers = ({ onClose }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    role: "",
    login: "",
    password: "",
    position: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    alert(`Добавленный пользователь:\n${JSON.stringify(formData, null, 2)}`);
    onClose(); // Закрываем модалку после добавления
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-50 z-50"
      onClick={onClose} // Закрытие при клике вне модалки
    >
      <div
        className="bg-white p-6 rounded-2xl shadow-lg w-1/2 relative"
        onClick={(e) => e.stopPropagation()} // Остановка всплытия клика внутри окна
      >
        {/* Заголовок и кнопка закрытия */}
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

        {/* Форма */}
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
            <label className="block text-gray-700 font-medium">
              Familiyasi
            </label>
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
              className="w-full border border-[#f3f9f6]  focus:outline-none rounded-xl p-2 py-3 mt-1 text-gray-700"
            />
          </div>

          <RoleDropdown
            value={formData.role}
            onChange={(role) => setFormData({ ...formData, role })}
            bgColor="bg-white"
            borderColor="border-[#f3f9f6]"
          />

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
              className="absolute right-3 top-10 text-gray-400 focus:outline-none hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>

          <PositionDropdown
            value={formData.position}
            onChange={(position) => setFormData({ ...formData, position })}
            bgColor="bg-white"
            borderColor="border-[#f3f9f6]"
          />

          <div className="relative">
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-500 focus:outline-none text-white py-3 rounded-xl mt-6.5 text-lg font-semibold hover:bg-blue-600 transition"
            >
              Qo‘shish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUsers;
