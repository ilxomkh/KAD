import React, { useState } from "react";
import { Check, X } from "lucide-react";

const BuildingExistenceSelector = ({
  id,
  buildingExists,
  setBuildingExists,
  // Теперь назовём это setVerdict, чтобы было понятно,
  // что мы устанавливаем именно verdict для geometry_fix
  setVerdict,
}) => {
  // Локальное состояние для показа дополнительного блока (радиокнопки)
  const [showToifasiOptions, setShowToifasiOptions] = useState(false);
  // Локальное состояние для выбранной «toifa»
  const [selectedToifa, setSelectedToifa] = useState("");

  // Выбор "Ha" или "Yo'q"
  const handleSelect = (status) => {
    setBuildingExists(status);

    if (status === false) {
      // Если выбрано "Yo‘q", показываем дополнительный блок
      setShowToifasiOptions(true);
    } else {
      // Если выбрано "Ha", скрываем блок и сбрасываем выбранное значение
      setShowToifasiOptions(false);
      setSelectedToifa("");
      // Если здание есть, то verdict не нужен
      setVerdict("");
    }
  };

  // Выбор радиокнопки (option1, option2)
  const handleRadioChange = (value) => {
    setSelectedToifa(value);
    // Сразу передаем значение «option1» / «option2» наверх (в ComparePage)
    setVerdict(value);
  };

  return (
    <div className="relative">
      {/* Блок выбора "Ha / Yo'q" */}
      <div className="absolute top-36 left-6 bg-white w-96 p-4 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold cursor-default mb-3">Qurilma mavjudmi?</h2>
        <div className="flex space-x-4">
          <button
            className={`px-10 py-3 cursor-pointer rounded-lg w-full flex justify-center items-center space-x-2 transition-all ${
              buildingExists === true
                ? "bg-[#1683ff] text-white"
                : "bg-[#f7f9fb] border border-[#e9e9eb] text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => handleSelect(true)}
          >
            <Check size={18} /> <span>Ha</span>
          </button>
          <button
            className={`px-10 py-3 cursor-pointer rounded-lg w-full flex justify-center items-center space-x-2 transition-all ${
              buildingExists === false
                ? "bg-[#e63946] text-white"
                : "bg-[#f7f9fb] text-gray-700 border border-[#e9e9eb] hover:bg-gray-100"
            }`}
            onClick={() => handleSelect(false)}
          >
            <X size={18} /> <span>Yo‘q</span>
          </button>
        </div>
      </div>

      {/* Дополнительный блок с радиокнопками (появляется, если выбран вариант "Yo‘q") */}
      {showToifasiOptions && (
        <div className="absolute top-72 left-6 bg-white w-96 px-4 py-3 rounded-2xl shadow-md">
          <h2 className="text-xl cursor-default font-semibold mb-3">Qurilma toifasini tanlang</h2>
          <div className="flex flex-col space-y-3">
            <label className="flex cursor-pointer items-center">
              <input
                type="radio"
                name="toifasi"
                value="option1"
                checked={selectedToifa === "option1"}
                onChange={(e) => handleRadioChange(e.target.value)}
                className="form-radio cursor-pointer h-5 w-5 text-blue-600"
              />
              <span className="ml-2">Toifasi mos emas</span>
            </label>
            <label className="flex cursor-pointer items-center">
              <input
                type="radio"
                name="toifasi"
                value="option2"
                checked={selectedToifa === "option2"}
                onChange={(e) => handleRadioChange(e.target.value)}
                className="form-radio cursor-pointer h-5 w-5 text-blue-600"
              />
              <span className="ml-2">Toifasi boshqa</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingExistenceSelector;
