import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import StatusBar from "../components/StatusBar";
import { ChevronRight } from "lucide-react";
import ArcGISTwoPolygonViewer from "../components/ArcGISTwoPolygonViewer";
import CommentModal from "../components/CommentModal";
import { BASE_URL } from "../utils/api";
import { useAuth } from "../context/AuthContext";

// Импорт компонентов react-pdf-viewer
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const AgencyReviewPage = () => {
  const { id } = useParams();
  if (!id) {
    console.error("Параметр id отсутствует");
  }
  const encodedId = encodeURIComponent(id);

  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();

  // Состояние для PDF URL
  const [pdfUrl, setPdfUrl] = useState(null);

  // Состояния для данных карты
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Состояния для модального окна комментария
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("obyekt");
  const [comment, setComment] = useState("");

  // Состояние для показа карты
  const [showMapViewer, setShowMapViewer] = useState(false);
  // Состояние для идентификатора из ответа API
  const [recordId, setRecordId] = useState(null);

  // Состояние для модального окна подтверждения
  const [showProceedModal, setShowProceedModal] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError("Отсутствует токен авторизации");
      setLoading(false);
      return;
    }

    // Запрос данных кадастра
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
        // Парсинг geojson для оригинальных координат
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
        // Парсинг fixedGeojson для модифицированных координат
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
          } else if (fixedGeojson.type === "Polygon" && fixedGeojson.coordinates) {
            modifiedCoords = fixedGeojson.coordinates[0].map(
              ([lon, lat]) => [lat, lon]
            );
          }
        } catch (e) {
          console.error("Ошибка парсинга fixedGeojson:", e);
        }
        setMapData({
          originalPolygonCoords: originalCoords,
          modifiedPolygonCoords: modifiedCoords,
        });
        setRecordId(data.ID);
        setLoading(false);

        // Запрос PDF-отчёта
        if (data.ID !== undefined && data.ID !== null) {
          fetch(`${BASE_URL}/api/cadastre/${data.ID}/generated_report`, {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          })
            .then((res) => {
              if (!res.ok) {
                throw new Error("Ошибка загрузки PDF отчёта");
              }
              return res.blob();
            })
            .then((blob) => {
              const url = URL.createObjectURL(blob);
              setPdfUrl(url);
            })
            .catch((err) => {
              console.error("Ошибка загрузки PDF отчёта:", err);
            });
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [encodedId, location.state, token]);

  // Функция отправки PATCH запроса
  const sendAgencyVerification = async (verified, commentStr) => {
    if (recordId === null) {
      console.error("recordId отсутствует, невозможно отправить запрос");
      return false;
    }
    const payload = { verified, comment: commentStr };
    console.log("Отправка данных на сервер (agency_verification):", payload);
    try {
      const response = await fetch(`${BASE_URL}/api/cadastre/${recordId}/agency_verification`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        console.log("Данные agency_verification успешно отправлены");
        return true;
      } else {
        console.error("Ошибка при отправке данных agency_verification");
        return false;
      }
    } catch (error) {
      console.error("Ошибка при отправке данных agency_verification:", error);
      return false;
    }
  };

  const handleProceed = async () => {
    console.log("Нажата кнопка Davom etish. Отправка agency_verification: { verified: true, comment: '' }");
    setSending(true);
    const result = await sendAgencyVerification(true, "");
    setSending(false);
    if (result) {
      navigate("/");
    }
  };

  const handleSend = async () => {
    const errorType = activeTab === "obyekt" ? "Obyekt joyiga mos emas" : "Toifasi mos emas";
    const finalComment = comment ? `${errorType}: ${comment}` : errorType;
    console.log("Нажата кнопка Yuklash. Отправка agency_verification:", {
      verified: false,
      comment: finalComment,
    });
    const result = await sendAgencyVerification(false, finalComment);
    if (result) {
      setComment("");
      setActiveTab("obyekt");
      setShowModal(false);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#e4ebf3] flex flex-col">
      <div className="px-8 pt-6">
        <StatusBar
          currentStep={3}
          id={recordId || id}
          onMapButtonClick={() => setShowMapViewer((prev) => !prev)}
          mapActive={showMapViewer}
        />
      </div>

      <div className="flex-grow flex justify-center items-center p-8">
        <div className="bg-white p-1 rounded-2xl max-w-4xl w-full flex flex-col items-center">
          {pdfUrl ? (
            // Используем react-pdf-viewer для отображения PDF
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <div style={{ height: '100%', width: '100%' }}>
                <Viewer fileUrl={pdfUrl} />
              </div>
            </Worker>
          ) : (
            <p className="text-gray-500">Загрузка документа...</p>
          )}
        </div>
      </div>

      <div className="fixed bottom-6 z-40 right-8 bg-white p-3 rounded-xl flex space-x-4">
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-xl flex items-center transition-all hover:bg-blue-700"
          onClick={() => setShowProceedModal(true)}
        >
          Davom etish <ChevronRight className="ml-2 w-6 h-6 mt-0.5" />
        </button>
      </div>

      <div className="fixed z-40 bottom-6 bg-white p-3 rounded-xl left-8 flex space-x-4">
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

      {showMapViewer && (
        <div className="fixed inset-0 z-30">
          <ArcGISTwoPolygonViewer
            backendPolygonCoords={mapData?.originalPolygonCoords || []}
            modifiedPolygonCoords={mapData?.modifiedPolygonCoords || []}
            onClose={() => setShowMapViewer(false)}
          />
        </div>
      )}

      {showProceedModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 pointer-events-auto">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-lg max-w-md w-full text-left relative">
            <h2 className="text-lg dark:text-gray-900 cursor-default font-semibold mb-4">
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
  );
};

export default AgencyReviewPage;
