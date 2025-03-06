import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { BASE_URL } from "../utils/api";


const RoleDropdown = ({ value, onChange, borderColor = "border-gray-300", bgColor = "bg-white" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Запрашиваем список пользователей и извлекаем уникальные роли
    const fetchRoles = async () => {
      try {
        const response = await fetch(`${BASE_URL}/users`);
        if (!response.ok) throw new Error("Ошибка сети");
        const users = await response.json();
        const uniqueRoles = Array.from(new Set(users.map(user => user.role))).filter(Boolean);
        const rolesData = uniqueRoles.map(role => ({ value: role, label: role }));
        setRoles(rolesData);
      } catch (error) {
        console.error("Ошибка получения ролей:", error);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (role) => {
    onChange(role);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-gray-700 font-medium mb-1">Roli</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex justify-between border items-center ${borderColor} ${bgColor} rounded-xl p-3 h-[50px] text-gray-700 transition`}
      >
        {value ? roles.find((r) => r.value === value)?.label : "Rolini tanlang"}
        <ChevronDown size={20} className="text-gray-500" />
      </button>
      {isOpen && (
        <div className={`absolute mt-2 w-full ${borderColor} bg-white rounded-xl z-10 transition-all duration-300`}>
          {roles.map((role) => (
            <button
              key={role.value}
              onClick={() => handleSelect(role.value)}
              className={`block w-full text-left px-4 py-3 text-gray-700 transition ${value === role.value ? "text-blue-500" : "hover:text-blue-500"}`}
            >
              {role.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoleDropdown;
