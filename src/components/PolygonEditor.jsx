import React, { useState } from "react";
import { Plus, Minus, Move } from "lucide-react";

const PolygonEditor = ({ setDragging, mapInstance }) => {
  const [activeButton, setActiveButton] = useState(null);

  const handleMove = () => {
    setActiveButton((prev) => (prev === "move" ? null : "move"));
    setDragging((prev) => {
      const newVal = !prev;
      console.log("PolygonEditor: toggled move, dragging =", newVal);
      return newVal;
    });
  };

  const handleZoomIn = () => {
    if (!mapInstance) return;
    setActiveButton("scaleUp");
    mapInstance.setZoom(mapInstance.getZoom() + 1);
    setTimeout(() => setActiveButton(null), 500);
  };

  const handleZoomOut = () => {
    if (!mapInstance) return;
    setActiveButton("scaleDown");
    mapInstance.setZoom(mapInstance.getZoom() - 1);
    setTimeout(() => setActiveButton(null), 500);
  };

  return (
    <div className="absolute top-1/2 right-4 transform -translate-y-1/2 space-y-3 z-50 pointer-events-auto">
      <div className="grid grid-cols-1 gap-6">
        <button
          className={`p-2 w-10 bg-white shadow-lg rounded-xl text-gray-700 transition-all ${
            activeButton === "move" ? "bg-blue-600 text-white" : "hover:bg-gray-200"
          }`}
          onClick={handleMove}
        >
          <Move size={24} />
        </button>
        <button
          className="p-2 w-10 bg-white shadow-lg rounded-xl text-gray-700 hover:bg-gray-200"
          onClick={handleZoomIn}
        >
          <Plus size={24} />
        </button>
        <button
          className="p-2 w-10 bg-white shadow-lg rounded-xl text-gray-700 hover:bg-gray-200"
          onClick={handleZoomOut}
        >
          <Minus size={24} />
        </button>
      </div>
    </div>
  );
};

export default PolygonEditor;
