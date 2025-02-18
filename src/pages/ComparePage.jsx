import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import StatusBar from "../components/StatusBar";
import { MapPin, Check, X, CheckIcon, ChevronRight } from "lucide-react";
import BuildingExistenceSelector from "../components/BuildingExistenceSelector";
import PolygonEditor from "../components/PolygonEditor";

const ComparePage = () => {
  const { kadasterId } = useParams();
  const location = useLocation();
  const [mapData, setMapData] = useState(null);
  const [buildingExists, setBuildingExists] = useState(null);
  const [showModal, setShowModal] = useState(false); // Модальное окно ошибки
  const [sending, setSending] = useState(false); // Состояние отправки
  const [isModified, setIsModified] = useState(false); // Было ли изменено что-то

  useEffect(() => {
    if (location.state) {
      setMapData(location.state);
    } else {
      fetch(`/api/maps/${kadasterId}`)
        .then((res) => res.json())
        .then((data) => setMapData(data))
        .catch((err) => console.error("Ошибка загрузки карты", err));
    }
  }, [kadasterId, location.state]);

  // Функция отправки документа при нажатии "Ha"
  const handleConfirmError = () => {
    setSending(true);
    fetch(`/api/send-error/${kadasterId}`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then(() => {
        setShowModal(false);
        setSending(false);
      })
      .catch((err) => {
        console.error("Ошибка отправки", err);
        setSending(false);
      });
  };

  const [polygonPoints, setPolygonPoints] = useState([
    { x: 100, y: 100 },
    { x: 200, y: 100 },
    { x: 200, y: 200 },
    { x: 100, y: 200 },
  ]);

  const handlePolygonUpdate = (newPoints) => {
    setPolygonPoints(newPoints);
  };

  const handleConfirmChanges = () => {
    fetch(`/api/save-map/${kadasterId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ polygon: polygonPoints }),
    })
      .then((res) => res.json())
      .then(() => {
        setIsModified(false); // После сохранения скрываем кнопку
      })
      .catch((err) => console.error("Ошибка сохранения", err));
  };

  return (
    <div className="min-h-screen w-screen bg-[#e4ebf3]">
      {/* Основной блок */}
      <div className="relative w-full h-[100vh] bg-[#e4ebf3] overflow-hidden">
        <div className="px-8 pt-8">
          <StatusBar currentStep={1} kadasterId={kadasterId} />
        </div>
        {mapData ? (
          <>
            {/* Карта */}
            <img
              src={mapData.mapUrl}
              alt="Карта"
              className="w-full h-full object-cover"
            />

            {/* Полигон на карте */}
            {isModified && (
              <div className="absolute top-40 right-8 rounded-xl flex space-x-4">
                <button
                  className="px-6 py-3 flex bg-white items-center justify-center text-black rounded-xl transition-all hover:bg-gray-100"
                  onClick={handleConfirmChanges}
                >
                  Tasdiqlash <CheckIcon size={18} className="ml-2" />
                </button>
              </div>
            )}

            {/* Блок выбора наличия здания */}
            <BuildingExistenceSelector
              buildingExists={buildingExists}
              setBuildingExists={setBuildingExists}
            />

            {/* Кнопки управления */}
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

            {/* Контролы масштабирования */}
            <div className="absolute right-8 top-1/2  transform -translate-y-1/2 space-y-3">
              <div className="grid grid-cols-1 space-y-2">
                <PolygonEditor
                  initialPoints={polygonPoints}
                  onUpdate={handlePolygonUpdate}
                />
              </div>
            </div>
            {showModal && (
              <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                <div className="bg-white px-4 py-2 rounded-2xl shadow-lg max-w-md w-full text-left relative">
                  <h2 className="text-lg font-semibold mb-4">
                    Xatolik borligini tasdiqlaysizmi?
                  </h2>

                  <div className="flex justify-center w-full space-x-4">
                    <button
                      className="px-6 py-2 w-full bg-blue-600 text-white rounded-xl transition-all hover:bg-blue-700 "
                      onClick={handleConfirmError}
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
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500">Загрузка карты...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparePage;
