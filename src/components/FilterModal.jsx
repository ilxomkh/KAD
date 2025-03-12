import { XCircle } from "lucide-react";
import React, { useState } from "react";

const FilterModal = ({ isOpen, onClose, onApply }) => {
  if (!isOpen) return null; // если модалка не открыта, ничего не рендерим

  // Состояние выбранных значений для каждой группы фильтрации
  const [selectedOptions, setSelectedOptions] = useState({
    region: "",
    modda: "",
    deadline: "",
    type: "",
    kadastr: "",
    status: "",
    district: "",
  });

  const handleSelect = (groupKey, value) => {
    console.log(`Выбрано для ${groupKey}:`, value);
    setSelectedOptions((prev) => ({ ...prev, [groupKey]: value }));
  };

  // Определяем массивы опций для каждой группы
  const regionOptions = [
    "Toshkent viloyati",
    "Surxondaryo",
    "Sirdaryo",
    "Farg‘ona",
    "Xorazm",
    "Andijon",
    "Buxoro",
    "Jizzax",
    "Qashqadaryo",
    "Navoyi",
    "Namangan",
    "Samarqand",
  ];
  const moddaOptions = ["5-modda", "6-modda", "7-modda", "8-modda", "9-modda"];
  const deadlineOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const typeOptions = ["Toifa-1", "Toifa-2"];
  const kadastrOptions = ["1-bosqich", "2-bosqich", "3-bosqich", "4-bosqich"];
  const statusOptions = ["Ha", "Yo‘q"];
  const districtOptions = ["Ha", "Yo‘q"];

  // Функция для отрисовки группы опций с передачей ключа для состояния
  const renderOptionGroup = (groupLabel, options, groupKey) => (
    <div className="mb-4">
      <p className="font-semibold mb-2">{groupLabel}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((item) => (
          <div
            key={item}
            onClick={() => handleSelect(groupKey, item)}
            className={`cursor-pointer border border-[#f3f3f6] rounded-full px-4 py-2 ${
              selectedOptions[groupKey] === item
                ? "bg-[#1477e6] text-white border-[#1477e6]"
                : "bg-white text-gray-700"
            }`}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );

  // При нажатии на кнопку "Qo‘llash" вызываем onApply с выбранными параметрами,
  // после чего закрываем модалку
  const handleApply = () => {
    console.log("Применение фильтров:", selectedOptions);
    onApply(selectedOptions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      {/* Контейнер модалки */}
      <div className="bg-white w-full max-w-3xl p-6 rounded-2xl relative">
        {/* Заголовок и кнопка закрытия */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Filter</h2>
          <button
            className="text-gray-500 cursor-pointer hover:text-gray-700"
            onClick={onClose}
          >
            <XCircle className="stroke-1" />
          </button>
        </div>

        {/* Основное содержимое модалки */}
        <div>
          {renderOptionGroup("Viloyat", regionOptions, "viloyat")}
          {renderOptionGroup("Modda", moddaOptions, "modda")}
          {renderOptionGroup("Qolgan kuni", deadlineOptions, "kuni")}
          {renderOptionGroup("Toifa", typeOptions, "toifa")}
          {renderOptionGroup("Kadastr kategoriyasi", kadastrOptions, "kadastr")}
          {renderOptionGroup("Status", statusOptions, "status")}
          {renderOptionGroup("Tekshiruv kategoriyasi", districtOptions, "tekshiruv")}
        </div>

        {/* Кнопки управления */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={handleApply}
            className="cursor-pointer px-4 py-4 w-full bg-[#1477e6] text-white rounded-2xl hover:bg-blue-600"
          >
            Qo‘llash
          </button>
          <button
            onClick={onClose}
            className="cursor-pointer px-4 py-4 w-full bg-[#f7f9fb] border border-[#e9e9eb] rounded-2xl hover:bg-gray-100"
          >
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
