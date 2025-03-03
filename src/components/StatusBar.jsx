// StatusBar.jsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import PdfIcon from "../assets/File Type.svg"; // Иконка PDF
import { Document, Page, pdfjs } from "react-pdf";
import MapButton from "./MapButton";

// Настройка worker для корректного рендеринга PDF
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const StatusBar = ({ currentStep, kadasterId, role, onMapButtonClick, mapActive }) => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState([
    { id: 1, label: "1-bosqich", name: "Solishtirish" },
    { id: 2, label: "2-bosqich", name: "Tekshirish" },
    { id: 3, label: "3-bosqich", name: "Agentlik tekshiruvi" },
  ]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setPdfUrl(null);
  }, []);

  return (
    <div className="flex items-center bg-white py-3 px-6 z-40 rounded-2xl w-full relative">
      <button
        className="mr-4 cursor-pointer text-gray-700 flex items-center hover:text-black transition"
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
          <MapButton
            kadasterId={kadasterId}
            onClick={onMapButtonClick}
            active={mapActive}
          />
        )}

        {/* PDF-кнопка с toggle и условными классами */}
        <button
          className={`w-16 h-16 cursor-pointer justify-center rounded-xl flex items-center transition ${
            showModal
              ? "border border-[#459cff] bg-[#e8f3ff]"
              : "bg-white text-white border border-[#e9e9eb]"
          }`}
          onClick={() => setShowModal((prev) => !prev)}
        >
          <img src={PdfIcon} alt="PDF" className="w-8 h-8" />
        </button>
      </div>

      {showModal && (
        <div className="absolute top-40 inset-0 flex justify-end items-center z-50">
          <div className="bg-white max-w-3xl w-full relative">
            {/* Кнопка закрытия удалена — для закрытия используйте PDF-кнопку */}
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
    </div>
  );
};

export default StatusBar;
