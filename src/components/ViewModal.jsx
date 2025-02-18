import { XCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";

const ViewModal = ({ item, onClose }) => {
  const [logs, setLogs] = useState(null);

  useEffect(() => {
    if (item && item.logs) {
      setLogs(item.logs);
    }
  }, [item]);

  return (
    <>
      {/* Затемнение фона */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose} // Закрытие при клике вне окна
      />

      {/* Контейнер модалки справа */}
      <div className="fixed right-0 top-0 h-screen w-1/4 bg-white shadow-lg rounded-l-2xl z-50 p-6">
        {/* Кнопка закрытия */}
        <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <XCircleIcon  className="w-8 h-8 stroke-1"/>
        </button>

        {/* Заголовок */}
        <h2 className="text-xl font-semibold mb-4">Loglar</h2>
        </div>

        {/* Проверка на наличие логов */}
        {!logs || logs.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Hozircha loglar yo‘q</div>
        ) : (
          <div className="p-4 bg-white">
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div key={index} className="border-b pb-4 last:border-none">
                  <p className="text-gray-800 font-medium">{log.user}</p>
                  <p className="text-gray-500 text-sm">{log.date}</p>
                  <span
                    className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                      log.step === "1-bosqich"
                        ? "bg-green-100 text-green-600"
                        : log.step === "2-bosqich"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {log.step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ViewModal;
