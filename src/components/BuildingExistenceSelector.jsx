import React from "react";

const BuildingExistenceSelector = ({
  selectedStatus,
  setSelectedStatus,
}) => {
  const options = [
    { label: "Ha", value: "exists" },
    { label: "Yo‘q", value: "nonexistent" },
    { label: "Qurilish davrida", value: "under_construction" },
  ];

  return (
    <div className="bg-white rounded-2xl p-4">
      <h2 className="text-xl font-semibold mb-3">Qurilma mavjudmi?</h2>
      <div className="flex space-x-6">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <input
              type="radio"
              className="form-radio h-4 w-4 text-blue-500"
              checked={selectedStatus === option.value}
              onChange={() => setSelectedStatus(option.value)}
            />
            <span className="text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default BuildingExistenceSelector;
