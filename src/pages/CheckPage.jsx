import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import StatusBar from "../components/StatusBar";
import ArcGISTwoPolygonViewer from "../components/ArcGISTwoPolygonViewer";
import CommentModal from "../components/CommentModal";
import { BASE_URL } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import CadastreInfo from "../components/infoButton";

const CheckPage = () => {
  const { id } = useParams();
  if (!id) {
    console.error("Параметр id отсутствует");
  }
  const encodedId = encodeURIComponent(id);
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("obyekt");
  const [comment, setComment] = useState("");
  const [recordId, setRecordId] = useState(null);
  // Состояние для модального окна подтверждения "Davom etish"
  const [showProceedModal, setShowProceedModal] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Отсутствует токен авторизации");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    fetch(`${BASE_URL}/api/cadastre/cad/${encodedId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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

        // Извлекаем оригинальные координаты из geojson
        let originalCoords = [];
        try {
          const geojson = JSON.parse(data.geojson);
          if (
            geojson.type === "FeatureCollection" &&
            geojson.features.length > 0
          ) {
            const firstFeature = geojson.features[0];
            if (firstFeature?.geometry?.coordinates) {
              originalCoords = firstFeature.geometry.coordinates[0].map(
                ([lon, lat]) => [lat, lon]
              );
            }
          } else if (
            geojson.type === "Feature" &&
            geojson.geometry?.coordinates
          ) {
            originalCoords = geojson.geometry.coordinates[0].map(
              ([lon, lat]) => [lat, lon]
            );
          }
        } catch (e) {
          console.error("Ошибка парсинга geojson:", e);
        }

        // Извлекаем изменённые координаты из fixedGeojson с дополнительной проверкой для типа "Polygon"
        let modifiedCoords = [];
        try {
          const fixedGeojson = JSON.parse(data.fixedGeojson);
          if (
            fixedGeojson.type === "FeatureCollection" &&
            fixedGeojson.features.length > 0
          ) {
            const firstFeature = fixedGeojson.features[0];
            if (firstFeature?.geometry?.coordinates) {
              modifiedCoords = firstFeature.geometry.coordinates[0].map(
                ([lon, lat]) => [lat, lon]
              );
            }
          } else if (
            fixedGeojson.type === "Feature" &&
            fixedGeojson.geometry?.coordinates
          ) {
            modifiedCoords = fixedGeojson.geometry.coordinates[0].map(
              ([lon, lat]) => [lat, lon]
            );
          } else if (
            fixedGeojson.type === "Polygon" &&
            fixedGeojson.coordinates
          ) {
            modifiedCoords = fixedGeojson.coordinates[0].map(([lon, lat]) => [
              lat,
              lon,
            ]);
          }
        } catch (e) {
          console.error("Ошибка парсинга fixedGeojson:", e);
        }

        // Сохраняем необходимые данные в mapData
        setMapData({
          originalPolygonCoords: originalCoords,
          modifiedPolygonCoords: modifiedCoords,
          verdict: data.verdict || "",
          buildingPresence: data.buildingPresence || "",
        });
        setRecordId(data.ID);
        setLoading(false);

        // Запрос скриншота, если он есть
        fetch(`${BASE_URL}/api/cadastre/${data.ID}/screenshot`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => {
            if (!res.ok) {
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

  const sendVerification = async (verified, commentStr) => {
    const payload = { verified, comment: commentStr };
    console.log("Отправка данных на сервер (verification):", payload);
    try {
      const response = await fetch(
        `${BASE_URL}/api/cadastre/${recordId}/verification`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
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

  const handleProceed = async () => {
    console.log(
      "Нажата кнопка Davom etish. Отправка verification: { verified: true, comment: '' }"
    );
    setSending(true);
    const result = await sendVerification(true, "");
    setSending(false);
    if (result) {
      navigate("/");
    }
  };

  const handleSend = async () => {
    const errorType =
      activeTab === "obyekt" ? "Obyekt joyiga mos emas" : "Toifasi mos emas";
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
    <div className=" max-h-screen bg-[#e4ebf3] flex">
      {loading && (
        <p className="text-gray-500 text-center mt-6">
          Загрузка данных карты...
        </p>
      )}
      {error && <p className="text-red-500 text-center mt-6">{error}</p>}
      {!loading && !error && mapData && (
        <div className="w-full flex">
          {/* Если есть фото – левая часть */}
          <div className="flex h-full w-screen">
            {/* Левая колонка (фото) */}
            {mapData.photo && (
              <div className="w-1/2 h-full">
                <img
                  src={mapData.photo}
                  alt="Фото объекта"
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                />
              </div>
            )}

            {/* Правая колонка (карта) */}
            <ArcGISTwoPolygonViewer
              backendPolygonCoords={mapData?.originalPolygonCoords || []}
              modifiedPolygonCoords={mapData?.modifiedPolygonCoords || []}
              isHalfWidth={!!mapData.photo} // Если фото есть, передаем true
            />
          </div>

          <div className="absolute top-0 left-0 p-6 w-full z-50">
            <StatusBar currentStep={2} id={id} />
          </div>
          {/* Блок для отображения buildingPresence */}
          <div className="absolute top-40 left-8 bg-white px-4 py-3 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold">
              Qurilma:{" "}
              <span className="text-gray-800">{mapData.buildingPresence}</span>
            </h2>
          </div>
          {/* Блок для отображения verdict */}
          <div className="absolute top-56 left-8 bg-white px-4 py-2 rounded-xl shadow-md">
            <p className="text-lg font-semibold">
              Verdit: <span className="text-blue-600">{mapData.verdict}</span>
            </p>
          </div>
          <div className="absolute top-80 right-3">
            <CadastreInfo cadastreId={recordId || id} />
          </div>
          {/* Кнопка "Davom etish" – открывает модальное окно подтверждения */}
          <div className="absolute bottom-6 right-8 bg-white p-3 rounded-xl flex space-x-4">
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-xl flex items-center transition-all hover:bg-blue-700"
              onClick={() => setShowProceedModal(true)}
            >
              Davom etish <ChevronRight className="ml-2 w-6 h-6" />
            </button>
          </div>
          <div className="absolute bottom-6 left-8 bg-white p-3 rounded-xl">
            <button
              className="px-6 py-3 bg-red-500 text-white rounded-xl transition-all hover:bg-red-600"
              onClick={() => setShowModal(true)}
            >
              Xatolik bor
            </button>
          </div>
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
          {/* Модальное окно подтверждения "Davom etishni tasdiqlaysizmi?" */}
          {showProceedModal && (
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 pointer-events-auto">
              <div className="bg-white px-4 py-2 rounded-2xl shadow-lg max-w-md w-full text-left relative">
                <h2 className="text-lg cursor-default font-semibold mb-4">
                  Davom etishni tasdiqlaysizmi?
                </h2>
                <div className="flex justify-center w-full space-x-4">
                  <button
                    className="px-6 py-3 w-full cursor-pointer bg-blue-500 text-white rounded-xl transition-all hover:bg-blue-600"
                    onClick={handleProceed}
                    disabled={sending}
                  >
                    {sending ? "Yuborilmoqda..." : "Ha"}
                  </button>
                  <button
                    className="px-6 py-3 w-full cursor-pointer bg-[#f7f9fb] border border-[#e9e9eb] text-gray-700 rounded-xl transition-all hover:bg-gray-100"
                    onClick={() => setShowProceedModal(false)}
                  >
                    Yo'q
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckPage;
