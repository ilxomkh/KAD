import { useState, useEffect } from "react";
import { Plus, Minus, Move } from "lucide-react";

const PolygonEditor = ({ initialPoints, onUpdate }) => {
  const [points, setPoints] = useState(initialPoints);
  const [activeButton, setActiveButton] = useState(null);

  useEffect(() => {
    onUpdate(points);
  }, [points, onUpdate]);

  // Функция для перемещения точки
  const handleMovePoint = (index, dx, dy) => {
    setPoints((prevPoints) =>
      prevPoints.map((point, i) =>
        i === index ? { x: point.x + dx, y: point.y + dy } : point
      )
    );
  };

  // Функция для добавления новой точки
  const handleAddPoint = () => {
    setActiveButton("move");
    const newPoint = { x: 50, y: 50 }; // Новая точка по умолчанию
    setPoints([...points, newPoint]);

    setTimeout(() => setActiveButton(null), 500);
  };

  // Функция для увеличения масштаба полигона
  const handleScaleUp = () => {
    setActiveButton("scaleUp");
    setPoints((prevPoints) =>
      prevPoints.map((point) => ({ x: point.x * 1.1, y: point.y * 1.1 }))
    );

    setTimeout(() => setActiveButton(null), 500);
  };

  // Функция для уменьшения масштаба полигона
  const handleScaleDown = () => {
    setActiveButton("scaleDown");
    setPoints((prevPoints) =>
      prevPoints.map((point) => ({ x: point.x * 0.9, y: point.y * 0.9 }))
    );

    setTimeout(() => setActiveButton(null), 500);
  };

  return (
    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 space-y-3">
      {/* Добавить точку */}
      <button
        className={`p-2 bg-white rounded-lg text-gray-700 transition-all ${
          activeButton === "move" ? "bg-[#1683FF] text-white" : "hover:bg-gray-100"
        }`}
        onClick={handleAddPoint}
      >
        <Move size={24} />
      </button>

      {/* Увеличить масштаб */}
      <button
        className={`p-2 bg-white rounded-lg text-gray-700 transition-all ${
          activeButton === "scaleUp" ? "bg-[#1683FF] text-white" : "hover:bg-gray-100"
        }`}
        onClick={handleScaleUp}
      >
        <Plus size={24} />
      </button>

      {/* Уменьшить масштаб */}
      <button
        className={`p-2 bg-white rounded-lg text-gray-700 transition-all ${
          activeButton === "scaleDown" ? "bg-[#1683FF] text-white" : "hover:bg-gray-100"
        }`}
        onClick={handleScaleDown}
      >
        <Minus size={24} />
      </button>
    </div>
  );
};

export default PolygonEditor;
