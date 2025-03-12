import { XCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { BASE_URL } from "../utils/api";
import { useAuth } from "../context/AuthContext"; // Импортируем useAuth

const ViewModal = ({ item, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  // Загружаем логи пользователей по userId (или нужному полю)
  useEffect(() => {
    if (item && item.ID) {
      setLoading(true);
      fetch(`${BASE_URL}/api/item_logs/by_user/${item.ID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Ошибка при загрузке логов");
          }
          return res.json();
        })
        .then((data) => {
          setLogs(data.data || []);
        })
        .catch((err) => {
          console.error("Ошибка загрузки логов:", err);
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [item, token]);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-screen w-full sm:w-1/3 md:w-1/4 bg-white shadow-lg rounded-l-2xl z-50 p-6 flex flex-col">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Loglar</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XCircleIcon className="stroke-1" />
          </button>
        </div>

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
                <div key={log.id} className="border-b border-dashed border-[#e3e3e9] pb-4 last:border-none">
                  <p className="text-gray-800 font-medium">
                    UserID: {log.userId}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Sana:{" "}
                    {new Date(log.datetime).toLocaleString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-gray-500 text-sm mb-1">
                    Izoh: {log.verdict || "—"}
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
      </div>
    </>
  );
};

export default ViewModal;
