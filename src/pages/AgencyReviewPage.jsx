// AgencyReviewPage.jsx
import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import StatusBar from "../components/StatusBar";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { ChevronRight } from "lucide-react";
import ArcGISTwoPolygonViewer from "../components/ArcGISTwoPolygonViewer";
import CommentModal from "../components/CommentModal";

// Указываем путь к worker-файлу
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
};

const AgencyReviewPage = () => {
  const { kadasterId } = useParams();
  const location = useLocation();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMapViewer, setShowMapViewer] = useState(false);
  const [activeTab, setActiveTab] = useState("obyekt");
  const [comment, setComment] = useState("");

  useEffect(() => {
    setLoading(true);

    if (location.state && location.state.reviewPdf) {
      setPdfUrl(location.state.reviewPdf);
      setLoading(false);
    } else {
      fetch(`/api/reviews/${kadasterId}`)
        .then((res) => res.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Ошибка загрузки PDF", err);
          setLoading(false);
        });
    }
  }, [kadasterId, location.state]);

  const handleSend = () => {
    // Логика отправки данных модального окна (например, отправка комментария)
    console.log("Отправка комментария", { activeTab, comment });
    // Сброс полей и закрытие модального окна
    setActiveTab("obyekt");
    setComment("");
    setShowModal(false);
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
          {loading ? (
            <p className="text-gray-500">Загрузка документа...</p>
          ) : pdfUrl ? (
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
            <p className="text-red-500">Не удалось загрузить документ</p>
          )}
        </div>
      </div>

      <div className="absolute bottom-6 z-40 right-8 bg-white p-3 rounded-xl flex space-x-4">
        <button className="px-6 cursor-pointer py-3 bg-blue-600 text-white rounded-xl flex items-center justify-center transition-all hover:bg-blue-700">
          Davom etish <ChevronRight className="ml-2 w-6 h-6 mt-0.5" />
        </button>
      </div>

      <div className="absolute z-40 bottom-6 bg-white p-3 rounded-xl left-8 flex space-x-4">
        <button
          className="px-6 py-3 cursor-pointer bg-red-500 text-white rounded-xl transition-all hover:bg-red-600"
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
            backendPolygonCoords={mockData.originalPolygonCoords}
            modifiedPolygonCoords={mockData.modifiedPolygonCoords}
            onClose={() => setShowMapViewer(false)}
          />
        </div>
      )}
    </div>
  );
};

export default AgencyReviewPage;
