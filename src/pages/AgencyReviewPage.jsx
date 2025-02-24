import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import StatusBar from "../components/StatusBar";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { ChevronRight } from "lucide-react";

// ✅ Указываем путь к worker-файлу (важно для Vite)
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const AgencyReviewPage = () => {
  const { kadasterId } = useParams();
  const location = useLocation();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  


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

  return (
    <div className="min-h-screen w-screen bg-[#e4ebf3] flex flex-col">
      {/* Верхний статус-бар */}
      <div className="px-8 pt-6">
        <StatusBar currentStep={3} kadasterId={kadasterId} />
      </div>

      {/* Основной контейнер */}
      <div className="flex-grow flex justify-center items-center p-8">
        <div className="bg-white p-6 rounded-2xl  max-w-4xl w-full flex flex-col items-center">
          {/* PDF Viewer */}
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

      {showModal && (
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 pointer-events-auto">
              <div className="bg-white px-4 py-2 rounded-2xl shadow-lg max-w-md w-full text-left relative">
                <h2 className="text-lg font-semibold mb-4">
                  Xatolik borligini tasdiqlaysizmi?
                </h2>
                <div className="flex justify-center w-full space-x-4">
                  <button
                    className="px-6 py-2 w-full bg-blue-600 text-white rounded-xl transition-all hover:bg-blue-700"
                    onClick={() => {
                      setSending(true);
                      setTimeout(() => {
                        setShowModal(false);
                        setSending(false);
                      }, 1000);
                    }}
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
    </div>
  );
};

export default AgencyReviewPage;
