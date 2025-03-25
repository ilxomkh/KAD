import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import PdfIcon from "../assets/File Type.svg"; // Иконка PDF
import PdfIconBlue from "../assets/File Type1.svg"; 
import { Document, Page, pdfjs } from "react-pdf";
import MapButton from "./MapButton";
import { BASE_URL } from "../utils/api";

// Настройка worker для корректного рендеринга PDF
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const StatusBar = ({ currentStep, id, role, onMapButtonClick, mapActive }) => {
  const navigate = useNavigate();
  const [steps] = useState([
    { id: 1, label: "1-bosqich", name: "Solishtirish" },
    { id: 2, label: "2-bosqich", name: "Tekshirish" },
    { id: 3, label: "3-bosqich", name: "Agentlik tekshiruvi" },
  ]);

  // Состояния для PDF, запрашиваемого с /cadastre/{id}/land_plan
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Состояния для PDF, запрашиваемого с /cadastre/{id}/generated_report
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState(null);
  const [generatedNumPages, setGeneratedNumPages] = useState(null);
  const [showModalGenerated, setShowModalGenerated] = useState(false);

  // Функция для запроса PDF с /cadastre/{id}/land_plan
  const fetchPdf = () => {
    // Если модальное окно уже открыто, закрываем его
    if (showModal) {
      setShowModal(false);
      return;
    }
    setPdfUrl(null);
    fetch(`${BASE_URL}/cadastre/${id}/land_plan`)
      .then((res) => {
        if (!res.ok) {
          return res.text().then((text) => {
            throw new Error(`HTTP error ${res.status}: ${text}`);
          });
        }
        return res.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setShowModal(true);
      })
      .catch((error) => {
        console.error("Error fetching PDF:", error);
      });
  };

  // Функция для запроса PDF с /cadastre/{id}/generated_report
  const fetchGeneratedPdf = () => {
    // Если модальное окно уже открыто, закрываем его
    if (showModalGenerated) {
      setShowModalGenerated(false);
      return;
    }
    setGeneratedPdfUrl(null);
    fetch(`${BASE_URL}/cadastre/${id}/generated_report`)
      .then((res) => {
        if (!res.ok) {
          return res.text().then((text) => {
            throw new Error(`HTTP error ${res.status}: ${text}`);
          });
        }
        return res.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setGeneratedPdfUrl(url);
        setShowModalGenerated(true);
      })
      .catch((error) => {
        console.error("Error fetching generated PDF:", error);
      });
  };

  // Освобождение URL для первого PDF при закрытии модального окна
  useEffect(() => {
    if (!showModal && pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  }, [showModal, pdfUrl]);

  // Освобождение URL для второго PDF при закрытии модального окна
  useEffect(() => {
    if (!showModalGenerated && generatedPdfUrl) {
      URL.revokeObjectURL(generatedPdfUrl);
      setGeneratedPdfUrl(null);
    }
  }, [showModalGenerated, generatedPdfUrl]);

  return (
    <div className="flex items-center bg-white py-3 px-6 z-40 rounded-2xl w-full relative">
      <button
        className="mr-4 cursor-pointer hover:text-blue-500 text-gray-700 flex items-center transition"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft size={20} className="mr-1" /> Orqaga
      </button>

      <div className="flex cursor-default items-center w-full justify-center">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex p-2 w-60 rounded-2xl transition-all ${
                currentStep === step.id
                  ? "bg-[#E6F6EE]"
                  : currentStep > step.id
                  ? "bg-[#E8F3FF]"
                  : "bg-[#f7f9fb]"
              }`}
            >
              <div
                className={`flex items-center mt-1 justify-center w-10 h-10 rounded-full font-bold text-md border-3 transition-all ${
                  currentStep === step.id
                    ? "bg-[#b0e2cc] text-green-800 border-[#00a359]"
                    : currentStep > step.id
                    ? "bg-[#b7d9ff] text-gray-700 border-[#1683ff]"
                    : "bg-white text-gray-500 border-[#b7d9ff]"
                }`}
              >
                {step.id}
              </div>
              <div
                className={`ml-2 font-medium grid grid-cols-1 transition-all ${
                  currentStep === step.id
                    ? "text-gray-700"
                    : currentStep > step.id
                    ? "text-gray-700"
                    : "text-gray-400"
                }`}
              >
                {step.label} <strong>{step.name}</strong>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-1 mr-2 transition-all duration-300 ${
                  currentStep > step.id ? "bg-[#00a359]" : "bg-gray-200"
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>

      <div className="flex ml-auto space-x-4">
        {currentStep === 3 && (
          <MapButton id={id} onClick={onMapButtonClick} active={mapActive} />
        )}

        {/* Кнопка для PDF с /cadastre/{id}/land_plan */}
        <div className="relative group">
          <button
            className={`w-16 h-16 cursor-pointer justify-center rounded-xl flex items-center transition ${
              showModal
                ? "border border-[#459cff] bg-[#e8f3ff]"
                : "bg-white text-white border border-[#e9e9eb]"
            }`}
            onClick={fetchPdf}
          >
            <img src={PdfIcon} alt="PDF" className="w-8 h-8" />
          </button>
          <div className="absolute right-0 top-24 mb-2 hidden group-hover:block">
              <span className="px-4 py-2 bg-white text-black text-md rounded-xl">
                Reja
              </span>
            </div>
        </div>

        {/* Если роль равна 2 – отображается вторая кнопка для PDF с /cadastre/{id}/generated_report */}
        {currentStep === 2 && (
          <div className="relative group">
            <button
              className={`w-16 h-16 cursor-pointer justify-center rounded-xl flex items-center transition ${
                showModalGenerated
                  ? "border border-[#459cff] bg-[#e8f3ff]"
                  : "bg-blue-100 text-white border border-blue-400"
              }`}
              onClick={fetchGeneratedPdf}
            >
              <img src={PdfIconBlue} alt="PDF" className="w-8 h-8" />
            </button>
            <div className="absolute -right-4 top-24 mb-2 hidden group-hover:block">
              <span className="px-4 py-2 bg-white text-black text-md rounded-xl">
                Xulosa
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно для PDF с /cadastre/{id}/land_plan */}
      {showModal && (
        <div className="absolute top-40 inset-0 flex justify-end items-center z-50">
          <div className="bg-white max-w-3xl w-full relative">
            <div className="overflow-hidden w-full flex justify-center p-2">
              {pdfUrl ? (
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
              ) : (
                <p className="text-gray-500 text-lg">
                  Файл не найден. Ожидается загрузка...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для PDF с /cadastre/{id}/generated_report */}
      {showModalGenerated && (
        <div className="absolute top-40 inset-0 flex justify-end items-center z-50">
          <div className="bg-white max-w-3xl w-full relative">
            <div className="overflow-hidden w-full flex justify-center p-2">
              {generatedPdfUrl ? (
                <Document
                  file={generatedPdfUrl}
                  onLoadSuccess={({ numPages }) =>
                    setGeneratedNumPages(numPages)
                  }
                  className="flex flex-col items-center"
                >
                  {Array.from(new Array(generatedNumPages), (_, index) => (
                    <Page
                      key={`page_generated_${index + 1}`}
                      pageNumber={index + 1}
                      width={600}
                    />
                  ))}
                </Document>
              ) : (
                <p className="text-gray-500 text-lg">
                  Файл не найден. Ожидается загрузка...
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusBar;
