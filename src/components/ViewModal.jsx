import { XCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";

const BASE_URL = "https://example.com"; // Замените на реальный базовый URL

const ViewModal = ({ item, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загружаем логи пользователей по userId
  useEffect(() => {
    if (item && item.userId) {
      setLoading(true);
      fetch(`${BASE_URL}/item_logs/by_user/${item.userId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Ошибка при загрузке логов");
          }
          return res.json();
        })
        .then((data) => {
          setLogs(data);
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [item]);

  return (
    <>
      {/* Затемнение фона при открытой модалке */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose} // Закрытие при клике вне окна
      />

      {/* Контейнер модалки справа */}
      <div className="fixed right-0 top-0 h-screen w-full sm:w-1/3 md:w-1/4 bg-white shadow-lg rounded-l-2xl z-50 p-6">
        {/* Шапка модалки */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Loglar</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XCircleIcon className="stroke-1" />
          </button>
        </div>

        {/* Содержимое модалки */}
        <div className="mt-4">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Yuklanmoqda...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : logs.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Hozircha loglar yo‘q
            </div>
          ) : (
            <div className="p-4 bg-white">
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="border-b pb-4 last:border-none">
                    {/* Пример отображения полей из API */}
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
                      Izoh: {log.comment}
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
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ViewModal;
