import React from "react";
import { Map } from "lucide-react";

const MapButton = ({ id, onClick, active }) => {
  return (
    <div className="group">
    <button
      className={`w-16 h-16 cursor-pointer group-hover:border-blue-300 group-hover:bg-blue-50 justify-center rounded-xl flex items-center transition ${
        active ? "border border-[#459cff] bg-[#e8f3ff]" : "border border-[#e9e9eb] bg-white"
      }`}
      onClick={onClick}
    >
      <Map className="text-gray-700 group-hover:text-blue-500" size={24} />
    </button>
    </div>
  );
};

export default MapButton;
