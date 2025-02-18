import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import StatusBar from "../components/StatusBar";
import { CheckIcon, ChevronRight } from "lucide-react";
import BuildingExistenceSelector from "../components/BuildingExistenceSelector";
import PolygonEditor from "../components/PolygonEditor";
import CadastreMap from "../components/CadastreMap";

const ComparePage = () => {
  const { kadasterId } = useParams();
  const location = useLocation();
  const [mapData, setMapData] = useState(null);
  const [buildingExists, setBuildingExists] = useState(null);
  const [showModal, setShowModal] = useState(false); // Модальное окно ошибки
  const [isModified, setIsModified] = useState(false); // Было ли изменено что-то
  const [sending, setSending] = useState(false); // Состояние отправки
  const [dragging, setDragging] = useState(false);


  const [polygonCoords, setPolygonCoords] = useState([
    [41.3, 69.24],
    [41.302, 69.242],
    [41.304, 69.24],
    [41.303, 69.238],
    [41.3, 69.24], // Замыкаем контур
  ]);

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
    <div className="relative min-h-screen w-screen">
      {/* ✅ Карта */}
      <CadastreMap polygonCoords={polygonCoords} setPolygonCoords={setPolygonCoords} dragging={dragging} />

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

      {/* ✅ Кнопки PolygonEditor теперь поверх карты */}
      <PolygonEditor setDragging={setDragging} />

      {/* ✅ UI элементы поверх карты */}
      <div className="relative z-10">
        <div className="px-8 pt-8">
          <StatusBar currentStep={1} kadasterId={kadasterId} />
        </div>

        <BuildingExistenceSelector
          buildingExists={buildingExists}
          setBuildingExists={setBuildingExists}
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
      </div>
    </div>
  );
};

export default ComparePage;
