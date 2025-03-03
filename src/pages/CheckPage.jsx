import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import StatusBar from "../components/StatusBar";
import { ChevronRight } from "lucide-react";
import ArcGISTwoPolygonViewer from "../components/ArcGISTwoPolygonViewer";
import CommentModal from "../components/CommentModal";

// Мок-данные с двумя полигонами и изображением
const mockData = {
  originalPolygonCoords: [
    [41.321, 69.251],
    [41.321, 69.261],
    [41.331, 69.261],
    [41.331, 69.251],
    [41.321, 69.251],
  ],
  modifiedPolygonCoords: [
    [41.32, 69.25],
    [41.32, 69.26],
    [41.33, 69.26],
    [41.33, 69.25],
    [41.32, 69.25],
  ],
  // photo: "https://via.placeholder.com/600x400", // Заглушка для фото
};

const CheckPage = () => {
  const { kadasterId } = useParams();
  const location = useLocation();

  // Состояния для данных карты
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Состояние статуса здания: true => "Mavjud", false => "Mavjud emas"
  const [buildingStatus, setBuildingStatus] = useState(false);

  // Состояния для модального окна
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("obyekt");
  const [comment, setComment] = useState("");
  const [obyektJoyidaEmas, setObyektJoyidaEmas] = useState(false);
  const [toldirilmagan, setToldirilmagan] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (
      location.state &&
      location.state.originalPolygonCoords &&
      location.state.modifiedPolygonCoords
    ) {
      setMapData(location.state);
    } else {
      setMapData(mockData);
    }
    setLoading(false);

    setTimeout(() => {
      setBuildingStatus(false);
    }, 500);
  }, [kadasterId, location.state]);

  // Обработчик отправки данных из модального окна
  const handleSend = () => {
    const selectedError =
      activeTab === "obyekt" ? "Obyekt joyiga mos emas" : "Toifasi mos emas";
    const dataToSend = {
      selectedError,
      comment,
      obyektJoyidaEmas,
      toldirilmagan,
      originalPolygonCoords: mapData?.originalPolygonCoords || [],
      modifiedPolygonCoords: mapData?.modifiedPolygonCoords || [],
    };

    console.log("Отправляем данные:", dataToSend);

    setComment("");
    setActiveTab("obyekt");
    setShowModal(false);
  };

  return (
    <div className="min-h-screen w-screen bg-[#e4ebf3] flex">
      {loading && (
        <p className="text-gray-500 text-center mt-6">
          Загрузка данных карты...
        </p>
      )}
      {error && <p className="text-red-500 text-center mt-6">{error}</p>}

      {!loading && !error && mapData && (
        <div className="relative w-full h-[100vh] flex">
          {/* Левая часть: Фото (если есть) */}
          {mapData.photo && (
            <div className="w-1/2 h-full">
              <img
                src={mapData.photo}
                alt="Фото объекта"
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Правая часть: Карта */}
          <div className={`${mapData.photo ? "w-1/2" : "w-full"} h-full`}>
            <ArcGISTwoPolygonViewer
              backendPolygonCoords={mapData.originalPolygonCoords}
              modifiedPolygonCoords={mapData.modifiedPolygonCoords}
            />
          </div>

          {/* Шапка с информацией */}
          <div className="absolute top-0 left-0 p-6 w-full z-50">
            <StatusBar currentStep={2} kadasterId={kadasterId} />
          </div>

          {/* Блок о статусе здания */}
          <div className="absolute top-40 left-8 bg-white px-4 py-3 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold">
              Qurilma:{" "}
              <span className={buildingStatus ? "text-green-600" : "text-red-600"}>
                {buildingStatus ? "Mavjud" : "Mavjud emas"}
              </span>
            </h2>
          </div>

          {/* Кнопка "Davom etish" */}
          <div className="absolute bottom-6 right-8 bg-white p-3 rounded-xl flex space-x-4">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl flex items-center transition-all hover:bg-blue-700">
              Davom etish <ChevronRight className="ml-2 w-6 h-6" />
            </button>
          </div>

          {/* Кнопка "Xatolik bor" */}
          <div className="absolute bottom-6 left-8 bg-white p-3 rounded-xl">
            <button
              className="px-6 py-3 bg-red-500 text-white rounded-xl transition-all hover:bg-red-600"
              onClick={() => setShowModal(true)}
            >
              Xatolik bor
            </button>
          </div>

          {/* Модальное окно */}
          {showModal && (
            <CommentModal
              comment={comment}
              setComment={setComment}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              handleSend={handleSend}
              onClose={() => setShowModal(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CheckPage;
