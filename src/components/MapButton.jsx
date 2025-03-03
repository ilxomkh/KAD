import React from "react";
import { Map } from "lucide-react";

const MapButton = ({ kadasterId, onClick, active }) => {
  return (
    <button
      className={`w-16 h-16 cursor-pointer justify-center rounded-xl flex items-center transition ${
        active ? "border border-[#459cff] bg-[#e8f3ff]" : "border border-[#e9e9eb] bg-white"
      }`}
      onClick={onClick}
    >
      <Map className="text-gray-700" size={24} />
    </button>
  );
};

export default MapButton;
