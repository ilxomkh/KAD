import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import StatusBar from "../components/StatusBar";
import BuildingExistenceSelector from "../components/BuildingExistenceSelector";
import ArcGISPolygonEditor from "../components/ArcGISPolygonEditor";
import FileUploadModal from "../components/FileUploadModal";
import { ChevronRight } from "lucide-react";
import { BASE_URL } from "../utils/api";
import { useAuth } from "../context/AuthContext"; // Импорт useAuth

const VerdictPage = () => {
  // Извлекаем параметр "id" из URL как строку (например, "01:01:0101010:120")
  const { id } = useParams();
  if (!id) {
    console.error("Параметр id отсутствует");
  }
  // Используем cadastreId для первого запроса
  const encodedId = encodeURIComponent(id);

  const location = useLocation();
  const navigate = useNavigate();

  // Получаем актуальный токен из контекста вместо жестко заданного
  const { token } = useAuth();

  // Состояния для данных карты, полученных с бэкенда
  const [polygonCoords, setPolygonCoords] = useState([]);
  // Состояния для выбора наличия здания и verdict
  const [buildingExists, setBuildingExists] = useState(null);
  const [verdict, setVerdict] = useState("");
  // Состояния для модального окна и загрузки фото
  const [showModal, setShowModal] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(true);
  const [sending, setSending] = useState(false);
  const [editedPolygonData, setEditedPolygonData] = useState(null);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  // Состояние для сохранения числового идентификатора из API (data.ID)
  const [recordId, setRecordId] = useState(null);

  // 1. Запрашиваем данные кадастра по эндпоинту /api/cadastre/{cadastreId}
  useEffect(() => {
    fetch(`${BASE_URL}/api/cadastre/cad/${encodedId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Используем токен из контекста
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Ошибка при загрузке данных кадастра");
        }
        return res.json();
      })
      .then((data) => {
        // Сохраняем числовой идентификатор из ответа API (data.ID)
        setRecordId(data.ID);

        // Если поле geojson присутствует, парсим его
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
  }, [encodedId, token]);

  // 2. Колбэк для загрузки фото
  const handlePhotoUpload = (photoUrl) => {
    setUploadedPhoto(photoUrl);
    setShowFileUpload(false);
  };

  // 3. Нажатие "Davom etish" – отправка данных verdict (используем recordId)
  const handleProceed = async () => {
    if (buildingExists === null || verdict.trim() === "") return;
    const payload = {
      buildingPresence: buildingExists,
      verdict: verdict,
    };
    if (recordId === null) {
      console.error("Отсутствует числовой идентификатор записи");
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/api/cadastre/${recordId}/verdict`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Используем токен из контекста
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        navigate("/role1tablepage");
      } else {
        console.error("Ошибка при отправке данных verdict");
      }
    } catch (error) {
      console.error("Ошибка при отправке данных verdict:", error);
    }
  };

  // 4. Обработчик для кнопки "Xatolik bor" в модальном окне (также с использованием recordId)
  const handleErrorConfirm = async () => {
    setSending(true);
    const payload = {
      cadastreError: true,
      comment: verdict,
    };
    if (recordId === null) {
      console.error("Отсутствует числовой идентификатор записи");
      setSending(false);
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/api/cadastre/${recordId}/cadastre_error`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // Используем токен из контекста
          },
          body: JSON.stringify(payload),
        }
      );
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
        {/* Если recordId уже получен, передаём его, иначе используем cadastreId из URL */}
        <StatusBar currentStep={1} id={recordId || id} />
      </div>

      {/* Блок выбора существования здания с verdict */}
      <div className="absolute top-0 left-0 z-50">
        <BuildingExistenceSelector
          buildingExists={buildingExists}
          setBuildingExists={setBuildingExists}
          id={recordId || id}
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
              disabled={buildingExists === null || verdict.trim() === ""}
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
          cadasterId={recordId || id}
        />
      )}
    </div>
  );
};

export default VerdictPage;
