import React, { useState } from "react";
import { Check, X } from "lucide-react";

const BuildingExistenceSelector = ({ kadasterId }) => {
  // Состояние: существует ли здание
  const [buildingExists, setBuildingExists] = useState(null);

  // Состояние, чтобы показывать дополнительный блок, если пользователь нажал «Ha»
  const [showToifasiOptions, setShowToifasiOptions] = useState(false);

  // Состояние для выбранной «toifa»
  const [selectedToifa, setSelectedToifa] = useState("");

  const sendBuildingStatus = async (status) => {
    // Сохраняем локально
    setBuildingExists(status);

    // Если нажали «Ha», показываем блок с радиокнопками
    if (status === true) {
      setShowToifasiOptions(true);
    } else {
      // Если нажали «Yo‘q», скрываем блок
      setShowToifasiOptions(false);
      setSelectedToifa("");
    }

    // Пример отправки данных на сервер
    try {
      const response = await fetch(`/api/building-status/${kadasterId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ exists: status }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при отправке данных");
      }

      console.log("Статус успешно сохранен:", status);
    } catch (error) {
      console.error("Ошибка:", error);
    }
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
            onClick={() => sendBuildingStatus(true)}
          >
            <Check size={18} /> <span>Ha</span>
          </button>
          <button
            className={`px-10 py-3 cursor-pointer rounded-lg w-full flex justify-center items-center space-x-2 transition-all ${
              buildingExists === false
                ? "bg-[#1683ff] text-white"
                : "bg-[#f7f9fb] text-gray-700 border border-[#e9e9eb] hover:bg-gray-100"
            }`}
            onClick={() => sendBuildingStatus(false)}
          >
            <X size={18} /> <span>Yo‘q</span>
          </button>
        </div>
      </div>

      {/* Дополнительный блок с радиокнопками (появляется, если нажали «Ha») */}
      {showToifasiOptions && (
        <div className="absolute top-72 left-6 bg-white w-96 px-4 py-3 rounded-2xl shadow-md">
          <h2 className="text-xl cursor-default font-semibold mb-3">Qurilma mavjudmi?</h2>
          <div className="flex flex-col space-y-3">
            <label className="flex cursor-pointer items-center">
              <input
                type="radio"
                name="toifasi"
                value="option1"
                checked={selectedToifa === "option1"}
                onChange={(e) => setSelectedToifa(e.target.value)}
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
                onChange={(e) => setSelectedToifa(e.target.value)}
                className="form-radio cursor-pointer h-5 w-5 text-blue-600"
              />
              <span className="ml-2">Toifasi mos emas</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingExistenceSelector;
