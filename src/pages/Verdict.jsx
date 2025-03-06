import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import StatusBar from "../components/StatusBar";
import BuildingExistenceSelector from "../components/BuildingExistenceSelector";
import ArcGISPolygonEditor from "../components/ArcGISPolygonEditor";
import FileUploadModal from "../components/FileUploadModal";
import { ChevronRight } from "lucide-react";

const VerdictPage = () => {
  const { kadasterId } = useParams(); // параметр из URL
  const location = useLocation();
  const navigate = useNavigate();

  const [polygonCoords, setPolygonCoords] = useState([]);
  const [buildingExists, setBuildingExists] = useState(null);
  const [verdict, setVerdict] = useState(""); // verdict для комментария
  const [showModal, setShowModal] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(true);
  const [sending, setSending] = useState(false);
  const [editedPolygonData, setEditedPolygonData] = useState(null);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);

  // 1. Запрашиваем geojson из бэкенда
  useEffect(() => {
    fetch(`/cadastres/${kadasterId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Ошибка при загрузке данных кадастра");
        }
        return res.json();
      })
      .then((data) => {
        if (data?.geojson) {
          try {
            const parsedGeoJSON = JSON.parse(data.geojson);
            if (
              parsedGeoJSON?.type === "FeatureCollection" &&
              parsedGeoJSON.features?.length > 0
            ) {
              const firstFeature = parsedGeoJSON.features[0];
              if (
                firstFeature?.geometry?.type === "Polygon" &&
                firstFeature.geometry.coordinates?.length > 0
              ) {
                // Преобразуем координаты из [долгота, широта] в [широта, долгота]
                const coords = firstFeature.geometry.coordinates[0].map(
                  ([lon, lat]) => [lat, lon]
                );
                setPolygonCoords(coords);
              }
            }
          } catch (err) {
            console.error("Ошибка парсинга geojson:", err);
          }
        }
      })
      .catch((err) => {
        console.error("Ошибка при загрузке кадастра:", err);
      });
  }, [kadasterId]);

  // 2. Колбэк, который вызывается после успешной загрузки фото
  const handlePhotoUpload = (photoUrl) => {
    setUploadedPhoto(photoUrl);
    setShowFileUpload(false);
  };

  // 3. Нажатие "Davom etish"
  const handleProceed = async () => {
    if (!editedPolygonData) return;

    const payload = {
      proceed: true,
      geometry: editedPolygonData.geometry,
      rotation: editedPolygonData.rotation,
      building_presence: buildingExists,
    };

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        navigate("/role1tablepage");
      }
    } catch (error) {
      console.error("Ошибка при отправке данных:", error);
    }
  };

  // 4. Обработчик для кнопки "Ha" в модальном окне "Xatolik bor"
  const handleErrorConfirm = async () => {
    setSending(true);
    const payload = {
      cadastreError: true,
      comment: verdict, // передаем verdict как комментарий
    };

    try {
      const response = await fetch(`/cadastres/${kadasterId}/cadastre_error`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        console.log("Данные cadastre_error успешно отправлены");
        navigate("/role1tablepage");
      } else {
        console.error("Ошибка при отправке данных cadastre_error");
      }
    } catch (error) {
      console.error("Ошибка при отправке данных cadastre_error:", error);
    } finally {
      setSending(false);
      setShowModal(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen flex">
      {/* Левая часть (если загружено фото) */}
      {uploadedPhoto && (
        <div className="w-1/2 h-full">
          <img
            src={uploadedPhoto}
            alt="Загруженное фото"
            className="w-full h-full object-cover rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* Правая часть (карта), если фото загружено → 50%, иначе 100% */}
      <div className={`${uploadedPhoto ? "w-1/2" : "w-full"} h-full`}>
        <ArcGISPolygonEditor
          backendPolygonCoords={
            polygonCoords && polygonCoords.length > 0
              ? polygonCoords
              : [[41.32, 69.25]]
          }
          editable={false}
          onChangePolygonData={setEditedPolygonData}
        />
      </div>

      {/* Шапка */}
      <div className="absolute top-0 left-0 p-6 w-full z-50">
        <StatusBar currentStep={1} kadasterId={kadasterId} />
      </div>

      {/* Блок выбора существования здания с verdict */}
      <div className="absolute top-0 left-0 z-50">
        <BuildingExistenceSelector
          buildingExists={buildingExists}
          setBuildingExists={setBuildingExists}
          kadasterId={kadasterId}
          setVerdict={setVerdict}
        />
      </div>

      {/* Контейнер для кнопок */}
      <div className="absolute bottom-0 left-0 w-full z-50 pointer-events-none">
        <div className="flex justify-between p-6 w-full">
          {/* Кнопка "Xatolik bor" */}
          <div className="pointer-events-auto bg-white p-3 rounded-xl">
            <button
              className="px-6 py-3 cursor-pointer bg-red-500 text-white rounded-xl transition-all hover:bg-red-600"
              onClick={() => setShowModal(true)}
            >
              Xatolik bor
            </button>
          </div>
          {/* Кнопка "Davom etish" */}
          <div className="pointer-events-auto bg-white p-3 rounded-xl">
            <button
              className="px-6 py-3 cursor-pointer bg-blue-600 text-white rounded-xl flex items-center justify-center transition-all hover:bg-blue-700"
              onClick={handleProceed}
              disabled={editedPolygonData === null || buildingExists === null}
            >
              Davom etish <ChevronRight className="ml-2 w-6 h-6 mt-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Модальное окно подтверждения "Xatolik bor" */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-lg max-w-md w-full text-left relative">
            <h2 className="text-lg font-semibold mb-4">
              Xatolik borligini tasdiqlaysizmi?
            </h2>
            <div className="flex justify-center w-full space-x-4">
              <button
                className="px-6 py-3 w-full cursor-pointer bg-[#e63946] text-white rounded-xl transition-all hover:bg-red-600"
                onClick={handleErrorConfirm}
                disabled={sending}
              >
                {sending ? "Yuborilmoqda..." : "Ha"}
              </button>
              <button
                className="px-6 py-3 w-full cursor-pointer bg-[#f7f9fb] border border-[#e9e9eb] text-gray-700 rounded-xl transition-all hover:bg-gray-100"
                onClick={() => setShowModal(false)}
              >
                Yo'q
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно загрузки фото */}
      {showFileUpload && (
        <FileUploadModal
          isOpen={showFileUpload}
          onClose={() => setShowFileUpload(false)}
          onUpload={handlePhotoUpload}
          cadasterId={kadasterId}
        />
      )}
    </div>
  );
};

export default VerdictPage;
