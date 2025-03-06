import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import StatusBar from "../components/StatusBar";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { ChevronRight } from "lucide-react";
import ArcGISTwoPolygonViewer from "../components/ArcGISTwoPolygonViewer";
import CommentModal from "../components/CommentModal";
import { BASE_URL } from "../utils/api";

// Указываем путь к worker-файлу для react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const AgencyReviewPage = () => {
  const { kadasterId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Состояния для PDF-отчёта
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);

  // Состояния для данных карты, полученных с бэкенда
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Убираем отображение статуса здания и verdict (их не показываем)
  // const [buildingStatus, setBuildingStatus] = useState(false);

  // Состояния для модального окна
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("obyekt");
  const [comment, setComment] = useState("");

  // Состояние для показа карты (MapViewer)
  const [showMapViewer, setShowMapViewer] = useState(false);

  // При загрузке страницы: запрашиваем данные кадастра (включая geojson) и PDF-отчёт
  useEffect(() => {
    setLoading(true);
    setError(null);

    // Запрашиваем данные кадастра с бэкенда
    fetch(`${BASE_URL}/api/cadastre/${kadasterId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Ошибка загрузки данных кадастра");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Полученные данные кадастра:", data);
        // Парсим geojson для originalPolygonCoords
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
        // Парсим fixedGeojson для modifiedPolygonCoords
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
        setMapData({
          originalPolygonCoords: originalCoords,
          modifiedPolygonCoords: modifiedCoords,
          // verdict и buildingPresence не отображаем
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });

    // Запрашиваем PDF-отчёт с бэкенда (endpoint: /api/cadastre/{id}/generated_report)
    fetch(`${BASE_URL}/api/cadastre/${kadasterId}/generated_report`)
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
  }, [kadasterId, location.state]);

  // Функция для отправки PATCH запроса к /api/cadastre/{id}/agency_verification
  // Формат: { "verified": boolean, "comment": "string" }
  const sendAgencyVerification = async (verified, commentStr) => {
    const payload = { verified, comment: commentStr };
    console.log("Отправка данных на сервер (agency_verification):", payload);
    try {
      const response = await fetch(`${BASE_URL}/api/cadastre/${kadasterId}/agency_verification`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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

  // Обработчик для кнопки "Davom etish" – verified: true, comment: ""
  const handleProceed = async () => {
    console.log("Нажата кнопка Davom etish. Отправка agency_verification: { verified: true, comment: '' }");
    const result = await sendAgencyVerification(true, "");
    if (result) {
      navigate("/");
    }
  };

  // Обработчик для модального окна "Xatolik bor" – verified: false, comment формируется из выбранного таба и введённого текста
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
          kadasterId={kadasterId}
          onMapButtonClick={() => setShowMapViewer((prev) => !prev)}
          mapActive={showMapViewer}
        />
      </div>

      <div className="flex-grow flex justify-center items-center p-8">
        <div className="bg-white p-6 rounded-2xl max-w-4xl w-full flex flex-col items-center">
          {pdfUrl ? (
            <div className="border border-gray-300 rounded-lg overflow-hidden w-full flex justify-center">
              <Document
                file={pdfUrl}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                className="flex flex-col items-center"
              >
                {Array.from(new Array(numPages), (_, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={600}
                  />
                ))}
              </Document>
            </div>
          ) : (
            <p className="text-gray-500">Загрузка документа...</p>
          )}
        </div>
      </div>

      <div className="absolute bottom-6 z-40 right-8 bg-white p-3 rounded-xl flex space-x-4">
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-xl flex items-center transition-all hover:bg-blue-700"
          onClick={handleProceed}
        >
          Davom etish <ChevronRight className="ml-2 w-6 h-6 mt-0.5" />
        </button>
      </div>

      <div className="absolute z-40 bottom-6 bg-white p-3 rounded-xl left-8 flex space-x-4">
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
    </div>
  );
};

export default AgencyReviewPage;
