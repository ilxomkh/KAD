import React, { useState, useEffect } from "react";
import PieChart from "./PieChart";
import DeviceStatsChart from "./DeviceStatsChart";
import ModdaStatsChart from "./ModdaStatsChart";
import CustomDateSelector from "./CustomDateSelector"; // 👈 подключаем кастомный селектор
import StatusChart from "./StatusChart";
import DownloadSVG from "../../assets/download.svg"; // 👈 путь к иконке загрузки
import { Download } from "lucide-react";

const Statistics = () => {
  const [selectedFilter, setSelectedFilter] = useState("Barcha vaqt");
  const [dateRange, setDateRange] = useState([null, null]);

  useEffect(() => {
    if (Array.isArray(dateRange)) {
      const [start, end] = dateRange;

      console.log("🔄 Filter:", selectedFilter);

      if (start && end) {
        console.log(
          "📅 Date range:",
          start.format("YYYY-MM-DD"),
          "→",
          end.format("YYYY-MM-DD")
        );
        // fetchData(selectedFilter, start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD"));
      } else {
        // 👉 Здесь можно сбросить фильтр или показать все данные
        console.log("📭 Sanalar tanlanmagan");
        // fetchAllData();
      }
    }
  }, [selectedFilter, dateRange]);

  return (
    <div className="p-6 space-y-6">
      {/* Вкладки фильтрации и календарь */}
      <div className="flex justify-between items-center mb-6 bg-white px-4 py-3 rounded-2xl">
        <div className="flex space-x-2">
          {["Barcha vaqt", "Yillik", "Oylik", "Haftalik", "Kunlik"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setSelectedFilter(tab)}
                className={`px-4 py-2 rounded-full transition ${
                  selectedFilter === tab
                    ? "bg-blue-500 text-white"
                    : " text-black hover:bg-blue-100 hover:text-blue-500"
                }`}
              >
                {tab}
              </button>
            )
          )}
          <CustomDateSelector
            onChange={(dates) => {
              setDateRange(dates);
              if (!dates) {
                setSelectedFilter("Barcha vaqt");
              }
            }}
          />
        </div>
        <button className="group text-black px-4 py-2 flex items-center justify-center hover:text-blue-500 transition">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2 w-6 h-6 transition-colors duration-200"
          >
            <path
              d="M21 13V13.8C21 16.7998 21 18.2997 20.2361 19.3511C19.9893 19.6907 19.6907 19.9893 19.3511 20.2361C18.2997 21 16.7998 21 13.8 21H10.2C7.20021 21 5.70032 21 4.64886 20.2361C4.30928 19.9893 4.01065 19.6907 3.76393 19.3511C3 18.2997 3 16.7998 3 13.8V13M12 3L12 15M12 15L15 12M12 15L9 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Yuklash
        </button>
      </div>

      {/* Графики */}
      <div className="flex w-full space-x-4">
        <div className="w-1/3 mr-4 bg-white flex rounded-2xl p-6">
          <PieChart />
        </div>
        <div className="w-1/2">
          <StatusChart />
        </div>
        <div className="w-full">
          <DeviceStatsChart />
        </div>
      </div>

      <ModdaStatsChart />
    </div>
  );
};

export default Statistics;
