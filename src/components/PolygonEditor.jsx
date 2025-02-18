import { useState } from "react";
import { Plus, Minus, Move } from "lucide-react";

const PolygonEditor = ({ setDragging }) => {
  const [activeButton, setActiveButton] = useState(null);

  // 🔹 Включение режима перемещения полигона
  const handleMove = () => {
    console.log("Кнопка Move нажата, меняем dragging...");
    setActiveButton((prev) => (prev === "move" ? null : "move"));
    setDragging((prev) => {
      console.log("Новое значение dragging:", !prev);
      return !prev;
    });
  };

  // 🔹 Увеличение зума
  const handleZoomIn = () => {
    if (!window.mapInstance) return;
    setActiveButton("scaleUp");
    window.mapInstance.setZoom(window.mapInstance.getZoom() + 1);
    setTimeout(() => setActiveButton(null), 500);
  };

  // 🔹 Уменьшение зума
  const handleZoomOut = () => {
    if (!window.mapInstance) return;
    setActiveButton("scaleDown");
    window.mapInstance.setZoom(window.mapInstance.getZoom() - 1);
    setTimeout(() => setActiveButton(null), 500);
  };

  return (
    <div className="absolute top-1/2 right-4 transform -translate-y-1/2 space-y-3 z-50 pointer-events-auto">
      <div className="grid grid-cols-1 gap-6">
        {/* 🔹 Включение режима перемещения */}
        <button
          className={`p-3 bg-white shadow-lg rounded-xl text-gray-700 transition-all ${
            activeButton === "move" ? "bg-[#1683FF] text-white" : "hover:bg-gray-200"
          }`}
          onClick={handleMove}
        >
          <Move size={24} />
        </button>

        {/* 🔹 Увеличение зума */}
        <button
          className="p-3 bg-white shadow-lg rounded-xl text-gray-700 hover:bg-gray-200"
          onClick={handleZoomIn}
        >
          <Plus size={24} />
        </button>

        {/* 🔹 Уменьшение зума */}
        <button
          className="p-3 bg-white shadow-lg rounded-xl text-gray-700 hover:bg-gray-200"
          onClick={handleZoomOut}
        >
          <Minus size={24} />
        </button>
      </div>
    </div>
  );
};

export default PolygonEditor;
