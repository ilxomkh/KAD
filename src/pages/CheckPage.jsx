import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import StatusBar from "../components/StatusBar";
import { ChevronRight } from "lucide-react";

const CheckPage = () => {
  const { kadasterId } = useParams();
  const location = useLocation();
  const [mapData, setMapData] = useState(null);
  const [buildingStatus, setBuildingStatus] = useState(false); // 🔹 Всегда есть блок, дефолт false
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);


  useEffect(() => {
    setLoading(true);
    setError(null);

    if (location.state) {
      setMapData(location.state);
      setLoading(false);
    } else {
      fetch(`/api/maps/${kadasterId}`)
        .then((res) => {
          if (!res.ok) throw new Error(`Ошибка загрузки карты (${res.status})`);
          return res.blob();
        })
        .then((blob) => {
          const imageUrl = URL.createObjectURL(blob);
          setMapData(imageUrl);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Ошибка загрузки изображения");
          setLoading(false);
        });
    }

    // 🔹 Эмуляция бэкенда (если сервера нет, используем false)
    setTimeout(() => {
      setBuildingStatus(false); // Изменить на true, если нужно "Mavjud" по умолчанию
    }, 500); // Имитация задержки запроса
  }, [kadasterId, location.state]);

  return (
    <div className="min-h-screen w-screen bg-[#e4ebf3]">
      {loading && (
        <p className="text-gray-500 text-center mt-6">
          Загрузка изображения...
        </p>
      )}
      {error && <p className="text-red-500 text-center mt-6">{error}</p>}

      {!loading && !error && (
        <div className="relative w-full h-[100vh] bg-black overflow-hidden">
          <div className="px-8 pt-8">
            <StatusBar currentStep={2} kadasterId={kadasterId} />
          </div>

          {/* 🔹 Блок всегда отображается */}
          <div className="absolute top-40 left-8 bg-white px-4 py-3 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold">
              Qurilma:{" "}
              <span
                className={buildingStatus ? "text-green-600" : "text-red-600"}
              >
                {buildingStatus ? "Mavjud" : "Mavjud emas"}
              </span>
            </h2>
          </div>

          <div className="absolute right-8 top-1/2 transform -translate-y-1/2 space-y-3">
            <div className="grid grid-cols-1 space-y-2">
              <button className="p-2 bg-white rounded-lg shadow-md text-gray-700 hover:bg-gray-100 transition-all">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 22.6667V12M12 12V1.33337M12 12H22.6667M12 12H1.33337"
                    stroke="#222432"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <button className="p-2 py-5 bg-white rounded-lg shadow-md text-gray-700 hover:bg-gray-100 transition-all">
                <svg
                  width="24"
                  height="2"
                  viewBox="0 0 24 2"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.6667 1H1.33337"
                    stroke="#222432"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="absolute bottom-6 right-8 bg-white p-3 rounded-xl flex space-x-4">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl flex items-center justify-center transition-all hover:bg-blue-700">
              Davom etish <ChevronRight className="ml-2 w-6 h-6 mt-0.5" />
            </button>
          </div>
          <div className="absolute bottom-6 bg-white p-3 rounded-xl left-8 flex space-x-4">
            <button
              className="px-6 py-3 bg-red-500 text-white rounded-xl transition-all hover:bg-red-600"
              onClick={() => setShowModal(true)}
            >
              Xatolik bor
            </button>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 pointer-events-auto">
              <div className="bg-white px-4 py-2 rounded-2xl shadow-lg max-w-md w-full text-left relative">
                <h2 className="text-lg font-semibold mb-4">
                  Xatolik borligini tasdiqlaysizmi?
                </h2>
                <div className="flex justify-center w-full space-x-4">
                  <button
                    className="px-6 py-2 w-full bg-blue-600 text-white rounded-xl transition-all hover:bg-blue-700"
                    onClick={() => {
                      setSending(true);
                      setTimeout(() => {
                        setShowModal(false);
                        setSending(false);
                      }, 1000);
                    }}
                    disabled={sending}
                  >
                    {sending ? "Yuborilmoqda..." : "Ha"}
                  </button>
                  <button
                    className="px-6 py-2 w-full bg-gray-200 text-gray-700 rounded-xl transition-all hover:bg-gray-300"
                    onClick={() => setShowModal(false)}
                  >
                    Yo'q
                  </button>
                </div>
              </div>
            </div>
          )}

          {mapData && (
            <img
              src={mapData}
              alt="Kadastr Map"
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CheckPage;