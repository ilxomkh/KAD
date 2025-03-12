import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

const RoleDropdown = ({
  value,
  onChange,
  borderColor = "border-gray-300",
  bgColor = "bg-white",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // Локальные данные для ролей
  const rolesData = [
    { value: "admin", label: "Adminstrator" },
    { value: "geometry_fix", label: "1-rol" },
    { value: "verify", label: "2-rol" },
    { value: "agency", label: "3-rol" },
    { value: "verdict_79", label: "4-rol" },
  ];
  const dropdownRef = useRef(null);

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
        className={`w-full flex justify-between items-center ${borderColor} ${bgColor} rounded-xl p-3 h-[50px] text-gray-700 transition`}
      >
        {value
          ? rolesData.find((r) => r.value === value)?.label
          : "Rolini tanlang"}
        <ChevronDown size={20} className="text-gray-500" />
      </button>
      {isOpen && (
        <div
          className={`absolute mt-2 w-full ${borderColor} bg-white rounded-xl shadow-lg z-10 transition-all duration-300`}
        >
          {rolesData.map((role) => (
            <button
              key={role.value}
              onClick={() => handleSelect(role.value)}
              className={`block w-full text-left px-4 py-3 text-gray-700 transition ${
                value === role.value ? "text-blue-500" : "hover:text-blue-500"
              }`}
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
