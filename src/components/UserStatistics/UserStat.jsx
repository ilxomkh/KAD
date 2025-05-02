import { ChevronDown, XCircleIcon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import PieChart from "./PieChart";
import TimeChart from "./TimeChart";
import DailyChart from "./DailyChart";
import CustomDateSelector from "../Statistics/CustomDateSelector";
import { DayPicker } from "react-day-picker";
import dayjs from "dayjs";
import axios from "axios";
import "react-day-picker/dist/style.css";
import Calendar from "../../assets/calendar-days.svg";
import HorizontalStackedBar from "./HorizontalStackedBar";
import { BASE_URL } from "../../utils/api";

const filters = ["Barcha vaqt", "Yillik", "Oylik", "Haftalik", "Kunlik"];

const UserStat = ({ item, onClose }) => {
  const [filter, setFilter] = useState("Barcha vaqt");
  const [dateRange, setDateRange] = useState([null, null]);
  const [singleDate, setSingleDate] = useState(null);
  const [showSinglePicker, setShowSinglePicker] = useState(false);
  const pickerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [generalData, setGeneralData] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [dailyGoalData, setDailyGoalData] = useState(null);
  const [buildingPresenceData, setBuildingPresenceData] = useState(null);

  const fetchAllStats = async (userId, selectedDate) => {
    try {
      setLoading(true);
      const fromDate = selectedDate
        ? dayjs(selectedDate).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD");
      const toDate = fromDate;

      const [generalRes, hourlyRes, dailyGoalRes, buildingPresenceRes] =
        await Promise.all([
          axios.get(`${BASE_URL}/user-statistics/${userId}/general`),
          axios.get(`${BASE_URL}/user-statistics/${userId}/hourly`),
          axios.get(`${BASE_URL}/user-statistics/${userId}/daily-goal`, {
            params: { fromDate, toDate },
          }),
          axios.get(`${BASE_URL}/user-statistics/${userId}/building-presence`),
        ]);

      setGeneralData(generalRes.data || {});
      setHourlyData(hourlyRes.data.data || []);
      setDailyGoalData(dailyGoalRes.data || {});
      setBuildingPresenceData(buildingPresenceRes.data || {});
    } catch (error) {
      console.error("Ошибка загрузки статистики:", error);
      setGeneralData(null);
      setHourlyData([]);
      setDailyGoalData(null);
      setBuildingPresenceData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (item?.ID || item?.id) {
      fetchAllStats(item.ID || item.id, singleDate);
    }
  }, [item, singleDate]);

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
    fetchAllStats(item.ID || item.id, null);
    setShowSinglePicker(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 h-screen bg-white rounded-l-2xl z-50 p-6 flex flex-col w-full max-w-[750px]">
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
        </div>

        <div className="mt-2 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="text-center text-gray-500">Yuklanmoqda...</div>
          ) : (
            <>
              {generalData ? (
                <>
                  <PieChart
                    total={generalData.total || 0}
                    completed={generalData.correctCompleted || 0}
                    error={generalData.receivedReports || 0}
                  />
                  <HorizontalStackedBar
                    buildingPresenceData={buildingPresenceData}
                  />
                </>
              ) : (
                <div className="text-center text-gray-400">
                  Umumiy statistika yo‘q
                </div>
              )}
              <div className="flex items-center justify-between w-full px-1">
                <span className="text-xl font-semibold">Kunlik statistika</span>

                <div className="relative">
                  <button
                    onClick={() => setShowSinglePicker((prev) => !prev)}
                    className="group text-black px-4 py-2 flex items-center justify-end hover:text-blue-500 transition"
                  >
                    <img
                      src={Calendar}
                      className="mr-2 w-6 h-6"
                      alt="calendar"
                    />
                    {singleDate
                      ? dayjs(singleDate).format("YYYY-MM-DD")
                      : "Sanani tanlang"}
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showSinglePicker && (
                    <div
                      ref={pickerRef}
                      className="absolute right-0 top-10 z-50 bg-white rounded-lg px-4 py-3 shadow-lg"
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

              {hourlyData.length > 0 ? (
                <TimeChart timeData={hourlyData} />
              ) : (
                <div className="text-center text-gray-400">
                  Vaqt bo‘yicha ma'lumot yo‘q
                </div>
              )}
              {dailyGoalData ? (
                <DailyChart
                  current={dailyGoalData.doneToday || 0}
                  norm={dailyGoalData.goal || 0}
                />
              ) : (
                <div className="text-center text-gray-400">
                  Kunlik ma'lumot yo‘q
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UserStat;
