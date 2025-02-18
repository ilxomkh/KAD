import { Check, X } from "lucide-react";

const BuildingExistenceSelector = ({ buildingExists, setBuildingExists, kadasterId }) => {
  const sendBuildingStatus = async (status) => {
    setBuildingExists(status);

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

      console.log("Статус успешно сохранен");
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  return (
    <div className="absolute top-40 left-8 items-center pl-3 py-1 bg-white w-76 h-24 rounded-2xl">
      <h2 className="text-lg font-semibold mb-3">Qurilma mavjudmi?</h2>
      <div className="flex space-x-4">
        <button
          className={`px-10 py-2 rounded-lg flex items-center space-x-2 transition-all ${
            buildingExists === true
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => sendBuildingStatus(true)}
        >
          <Check size={18} /> <span>Ha</span>
        </button>
        <button
          className={`px-10 py-2 rounded-lg flex items-center space-x-2 transition-all ${
            buildingExists === false
              ? "bg-red-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => sendBuildingStatus(false)}
        >
          <X size={18} /> <span>Yo‘q</span>
        </button>
      </div>
    </div>
  );
};

export default BuildingExistenceSelector;
