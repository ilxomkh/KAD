import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

const PositionDropdown = ({ value, onChange, borderColor = "border-gray-300", bgColor = "bg-white" }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Локальные данные для позиций пользователя
  const positionsData = [
    { value: "Analitik", label: "Analitik" },
    { value: "Valanter", label: "Valanter" },
    { value: "Agentlik", label: "Agentlik" },
    { value: "Rahbar", label: "Rahbar" }
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

  const handleSelect = (position) => {
    onChange(position);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-gray-700 font-medium mb-1">Lavozim</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex justify-between items-center ${borderColor} ${bgColor} rounded-xl p-3 h-[50px] text-gray-700 transition`}
      >
        {value ? positionsData.find((p) => p.value === value)?.label : "Lavozimini tanlang"}
        <ChevronDown size={20} className="text-gray-500" />
      </button>
      {isOpen && (
        <div className={`absolute mt-2 w-full ${borderColor} bg-white rounded-xl shadow-lg z-10 transition-all duration-300`}>
          {positionsData.map((position) => (
            <button
              key={position.value}
              onClick={() => handleSelect(position.value)}
              className={`block w-full text-left px-4 py-3 text-gray-700 transition ${value === position.value ? "text-blue-500" : "hover:text-blue-500"}`}
            >
              {position.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PositionDropdown;
