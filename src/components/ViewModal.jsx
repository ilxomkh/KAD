import {
  XCircleIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CalendarIcon,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { BASE_URL } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import dayjs from "dayjs";

import CustomDatePicker from "./CustomDatePicker";

const ViewModal = ({ item, onClose }) => {
  const { token } = useAuth();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // pagination & date filter
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const pickerRef = useRef();

  // Закрываем календарь по клику вне него
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchLogs = () => {
    if (!item?.ID) return;
    setLoading(true);
    setError(null);

    const url = new URL(`${BASE_URL}/api/item_logs/by_user/${item.ID}`);
    url.searchParams.set("page", page);
    url.searchParams.set("pageSize", 10);
    if (selectedDate) {
      url.searchParams.set("date", dayjs(selectedDate).format("YYYY-MM-DD"));
    }

    fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка при загрузке логов");
        return res.json();
      })
      .then(({ data, meta }) => {
        setLogs(data || []);
        setTotalPages(meta?.totalPages || 1);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, token, page, selectedDate]);

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-50" onClick={onClose} />

      <div className="fixed right-0 top-0 h-screen w-full sm:w-1/3 md:w-1/4 bg-white rounded-l-2xl z-50 p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Loglar</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XCircleIcon className="stroke-1" />
          </button>
        </div>

        {/* Date filter */}
        <div className="mt-4 relative">
          <button
            onClick={() => setShowDatePicker((v) => !v)}
            className="flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <CalendarIcon className="mr-2 w-5 h-5 text-gray-600" />
            {selectedDate
              ? dayjs(selectedDate).format("YYYY-MM-DD")
              : "Sanani tanlang"}
            <ChevronDown className="ml-2 w-4 h-4 text-gray-600" />
          </button>
          {showDatePicker && (
            <div
              ref={pickerRef}
              className="absolute top-full mt-2 z-50"
            >
              <CustomDatePicker
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setPage(1);
                  setShowDatePicker(false);
                }}
                fromYear={2023}
                toYear={2030}
              />
            </div>
          )}
        </div>

        {/* Logs list */}
        <div className="mt-4 flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Yuklanmoqda...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : logs.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Hozircha loglar yo‘q
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border-b border-dashed border-[#e3e3e9] pb-4 last:border-none"
                >
                  <p className="text-gray-800 font-medium">
                    UserID: {log.userId}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Sana: {dayjs(log.datetime).format("DD.MM.YYYY, HH:mm:ss")}
                  </p>
                  <p className="text-gray-500 text-sm mb-1">
                    Izoh: {log.comment || "—"}
                  </p>
                  <span
                    className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                      log.success
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {log.processedStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between space-x-4">
          <button
            onClick={() => page > 1 && setPage((p) => p - 1)}
            disabled={page <= 1}
            className="p-2 rounded-full cursor-pointer hover:bg-gray-200 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-gray-700">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => page < totalPages && setPage((p) => p + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-full cursor-pointer hover:bg-gray-200 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
};

export default ViewModal;
