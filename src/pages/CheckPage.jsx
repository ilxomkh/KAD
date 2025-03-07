import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import StatusBar from "../components/StatusBar";
import ArcGISTwoPolygonViewer from "../components/ArcGISTwoPolygonViewer";
import CommentModal from "../components/CommentModal";
import { BASE_URL } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const CheckPage = () => {
  // Получаем параметр из URL (это cadastreId, например "01:01:0101010:120")
  const { id } = useParams();
  if (!id) {
    console.error("Параметр id отсутствует");
  }
  // Кодируем cadastreId для запроса деталей
  const encodedId = encodeURIComponent(id);

  const location = useLocation();
  const navigate = useNavigate();

  // Получаем токен из контекста (он сохраняется при логине в localStorage)
  const { token } = useAuth();

  // Состояния
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buildingStatus, setBuildingStatus] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("obyekt");
  const [comment, setComment] = useState("");
  // Сохранённый числовой id (поле "ID" из ответа API)
  const [recordId, setRecordId] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("Отсутствует токен авторизации");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    // Получаем данные кадастра по cadastreId
    fetch(`${BASE_URL}/api/cadastre/cad/${encodedId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Ошибка загрузки данных кадастра");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Полученные данные кадастра:", data);

        // Парсим geojson для оригинальных координат
        let originalCoords = [];
        try {
          const geojson = JSON.parse(data.geojson);
          if (geojson.type === "FeatureCollection" && geojson.features.length > 0) {
            const firstFeature = geojson.features[0];
            if (firstFeature?.geometry?.coordinates) {
              originalCoords = firstFeature.geometry.coordinates[0].map(
                ([lon, lat]) => [lat, lon]
              );
            }
          } else if (geojson.type === "Feature" && geojson.geometry?.coordinates) {
            originalCoords = geojson.geometry.coordinates[0].map(
              ([lon, lat]) => [lat, lon]
            );
          }
        } catch (e) {
          console.error("Ошибка парсинга geojson:", e);
        }

        // Парсим fixedGeojson для изменённых координат
        let modifiedCoords = [];
        try {
          const fixedGeojson = JSON.parse(data.fixedGeojson);
          if (fixedGeojson.type === "FeatureCollection" && fixedGeojson.features.length > 0) {
            const firstFeature = fixedGeojson.features[0];
            if (firstFeature?.geometry?.coordinates) {
              modifiedCoords = firstFeature.geometry.coordinates[0].map(
                ([lon, lat]) => [lat, lon]
              );
            }
          } else if (fixedGeojson.type === "Feature" && fixedGeojson.geometry?.coordinates) {
            modifiedCoords = fixedGeojson.geometry.coordinates[0].map(
              ([lon, lat]) => [lat, lon]
            );
          }
        } catch (e) {
          console.error("Ошибка парсинга fixedGeojson:", e);
        }

        // Сохраняем полученные данные и сохраняем числовой id из data.ID
        setMapData({
          originalPolygonCoords: originalCoords,
          modifiedPolygonCoords: modifiedCoords,
          verdict: data.verdict || "",
        });
        setBuildingStatus(data.buildingPresence);
        setRecordId(data.ID);
        setLoading(false);

        // После получения данных используем числовой id для запроса скриншота
        fetch(`${BASE_URL}/api/cadastre/${data.ID}/screenshot`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })
          .then((res) => {
            if (!res.ok) {
              // Если скриншот не найден (например, 404), возвращаем null
              return null;
            }
            return res.blob();
          })
          .then((blob) => {
            if (blob) {
              const imageUrl = URL.createObjectURL(blob);
              setMapData((prev) =>
                prev ? { ...prev, photo: imageUrl } : { photo: imageUrl }
              );
            }
          })
          .catch((err) => {
            console.error("Ошибка загрузки скриншота:", err);
          });
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [encodedId, location.state, token]);

  // Функция для отправки PATCH запроса к /cadastre/{recordId}/verification
  const sendVerification = async (verified, commentStr) => {
    const payload = { verified, comment: commentStr };
    console.log("Отправка данных на сервер (verification):", payload);
    try {
      const response = await fetch(`${BASE_URL}/api/cadastre/${recordId}/verification`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        console.log("Данные verification успешно отправлены");
        return true;
      } else {
        console.error("Ошибка при отправке данных verification");
        return false;
      }
    } catch (error) {
      console.error("Ошибка при отправке данных verification:", error);
      return false;
    }
  };

  // Обработчик для кнопки "Davom etish"
  const handleProceed = async () => {
    console.log("Нажата кнопка Davom etish. Отправка verification: { verified: true, comment: '' }");
    const result = await sendVerification(true, "");
    if (result) {
      navigate("/");
    }
  };

  // Обработчик для модального окна "Xatolik bor"
  const handleSend = async () => {
    const errorType = activeTab === "obyekt" ? "Obyekt joyiga mos emas" : "Toifasi mos emas";
    const finalComment = comment ? `${errorType}: ${comment}` : errorType;
    console.log("Нажата кнопка Yuklash. Отправка verification:", {
      verified: false,
      comment: finalComment,
    });
    const result = await sendVerification(false, finalComment);
    if (result) {
      setComment("");
      setActiveTab("obyekt");
      setShowModal(false);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#e4ebf3] flex">
      {loading && (
        <p className="text-gray-500 text-center mt-6">Загрузка данных карты...</p>
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
              backendPolygonCoords={
                mapData.originalPolygonCoords && mapData.originalPolygonCoords.length > 0
                  ? mapData.originalPolygonCoords
                  : [[41.32, 69.25]]
              }
              modifiedPolygonCoords={
                mapData.modifiedPolygonCoords && mapData.modifiedPolygonCoords.length > 0
                  ? mapData.modifiedPolygonCoords
                  : [[41.32, 69.25]]
              }
            />
          </div>
          {/* Шапка с информацией */}
          <div className="absolute top-0 left-0 p-6 w-full z-50">
            <StatusBar currentStep={2} id={id} />
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
          {/* Блок для отображения verdict */}
          {mapData.verdict && (
            <div className="absolute top-56 left-8 bg-white px-4 py-2 rounded-xl shadow-md">
              <p className="text-lg font-semibold">
                Verdit: <span className="text-blue-600">{mapData.verdict}</span>
              </p>
            </div>
          )}
          {/* Кнопка "Davom etish" */}
          <div className="absolute bottom-6 right-8 bg-white p-3 rounded-xl flex space-x-4">
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-xl flex items-center transition-all hover:bg-blue-700"
              onClick={handleProceed}
            >
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
