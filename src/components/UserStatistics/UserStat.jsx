import { ChevronDown, ChevronRight, XCircleIcon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import PieChart from "./PieChart";
import TimeChart from "./TimeChart";
import DailyChart from "./DailyChart";
import CustomDateSelector from "../Statistics/CustomDateSelector";
import { DayPicker } from "react-day-picker";
import dayjs from "dayjs";
import "react-day-picker/dist/style.css";
import Calendar from "../../assets/calendar-days.svg";
import DownloadIcon from "../../assets/download.svg";
import HorizontalStackedBar from "./HorizontalStackedBar"; // путь подкорректируй по структуре проекта

const filters = ["Barcha vaqt", "Yillik", "Oylik", "Haftalik", "Kunlik"];

// ... все импорты оставляешь такими же

const UserStat = ({ item, onClose }) => {
  const [filter, setFilter] = useState("Barcha vaqt");
  const [dateRange, setDateRange] = useState([null, null]);
  const [singleDate, setSingleDate] = useState(null);
  const [showSinglePicker, setShowSinglePicker] = useState(false);
  const pickerRef = useRef(null);

  const [pieData, setPieData] = useState(null);
  const [chartsData, setChartsData] = useState(null);

  const [loadingPie, setLoadingPie] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);

  useEffect(() => {
    if (!item) return;
    setLoadingPie(true);
    setTimeout(() => {
      setPieData({
        total: 219091,
        completed: 149821,
        error: 47689,
      });
      setLoadingPie(false);
    }, 500);
  }, [item, filter, dateRange]);

  const loadChartsData = (date) => {
    setLoadingCharts(true);
    setTimeout(() => {
      setChartsData({
        timeData: date
          ? [{ time: "09:05" }, { time: "12:10" }, { time: "15:35" }]
          : [
              { time: "09:15" },
              { time: "10:30" },
              { time: "11:45" },
              { time: "13:20" },
            ],
        dailyCount: date ? 123 : 172,
      });
      setLoadingCharts(false);
    }, 500);
  };

  useEffect(() => {
    loadChartsData(singleDate);
  }, [singleDate, item]);

  const handleOutsideClick = (e) => {
    if (pickerRef.current && !pickerRef.current.contains(e.target)) {
      setShowSinglePicker(false);
    }
  };

  useEffect(() => {
    if (showSinglePicker) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showSinglePicker]);

  const clearSingleDate = () => {
    setSingleDate(null);
    loadChartsData(null);
    setShowSinglePicker(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 h-screen bg-white rounded-l-2xl z-50 p-6 flex flex-col">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Foydalanuvchi statistikasi</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XCircleIcon className="stroke-1" />
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-full transition ${
                  filter === f
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="min-w-[160px]">
            <CustomDateSelector
              onChange={(dates) => {
                setDateRange(dates);
                if (!dates || !dates[0] || !dates[1]) {
                  setFilter("Barcha vaqt");
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

        <div className="mt-2 overflow-y-auto flex-1 space-y-6">
          {loadingPie ? (
            <div className="text-center text-gray-500">Yuklanmoqda...</div>
          ) : pieData ? (
            <>
              <PieChart
                total={pieData.total}
                completed={pieData.completed}
                error={pieData.error}
              />
              <HorizontalStackedBar />
            </>
          ) : null}

          <div className="relative flex items-center justify-between text-sm">
            <p className="font-semibold text-xl">Kunlik statistika</p>
            <div className="relative">
              <button
                onClick={() => setShowSinglePicker((prev) => !prev)}
                className="px-4 py-2 rounded-full transition flex items-center bg-white border border-gray-100 text-gray-700 hover:bg-blue-50"
              >
                <img src={Calendar} className="mr-2" />
                {singleDate
                  ? dayjs(singleDate).format("YYYY-MM-DD")
                  : "Sanani tanlang"}
                <ChevronDown className="w-4 h-4" />
              </button>

              {showSinglePicker && (
                <div
                  ref={pickerRef}
                  className="absolute right-0 top-10 z-50 bg-white rounded-lg px-4"
                >
                  <DayPicker
                    mode="single"
                    selected={singleDate}
                    onSelect={(date) => {
                      setSingleDate(date);
                      setShowSinglePicker(false);
                    }}
                    captionLayout="dropdown-buttons"
                    fromYear={2023}
                    toYear={2030}
                  />
                  <button
                    onClick={clearSingleDate}
                    className="mt-2 w-full px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100"
                  >
                    Oʻchirish
                  </button>
                </div>
              )}
            </div>
          </div>

          {loadingCharts ? (
            <div className="text-center text-gray-500">Yuklanmoqda...</div>
          ) : chartsData ? (
            <>
              <TimeChart timeData={chartsData.timeData} />
              <DailyChart current={chartsData.dailyCount} norm={200} />
            </>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default UserStat;
