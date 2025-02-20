import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronLeft, XCircle } from "lucide-react";
import PdfIcon from "../assets/File Type.svg"; // Иконка PDF
import { Document, Page, pdfjs } from "react-pdf";

// Настройка worker для корректного рендеринга PDF
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const StatusBar = ({ currentStep, kadasterId }) => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState([
    { id: 1, label: "1-bosqich", name: "Solishtirish" },
    { id: 2, label: "2-bosqich", name: "Tekshirish" },
    { id: 3, label: "3-bosqich", name: "Agentlik tekshiruvi" },
  ]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Заглушка, чтобы можно было открыть модалку без PDF
  useEffect(() => {
    setPdfUrl(null); // Пока нет реального файла, заглушка
  }, []);

  return (
    <div className="flex items-center bg-white py-3 px-6 rounded-2xl w-full">
      {/* Кнопка "Назад" */}
      <button
        className="mr-4 text-gray-700 flex items-center hover:text-black transition"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft size={20} className="mr-1" /> Orqaga
      </button>

      {/* Статус-бар */}
      <div className="flex items-center w-full justify-center">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Индикатор шага */}
            <div
              className={`flex p-2 w-60 rounded-2xl transition-all ${currentStep === step.id
                  ? "bg-[#E6F6EE]" // Текущий этап (зелёный фон)
                  : currentStep > step.id
                    ? "bg-[#E8F3FF]" // Пройденный этап (синий фон)
                    : "bg-[#f7f9fb]" // Будущие этапы (серый фон)
                }`}
            >
              <div
                className={`flex items-center mt-1 justify-center w-10 h-10 rounded-full font-bold text-md border-3 transition-all ${currentStep === step.id
                    ? "bg-[#b0e2cc] text-green-800 border-[#00a359]"
                    : currentStep > step.id
                      ? "bg-[#b7d9ff] text-gray-700 border-[#1683ff]"
                      : "bg-white text-gray-500 border-[#b7d9ff]"
                  }`}
              >
                {step.id}
              </div>

              {/* Название шага */}
              <div
                className={`ml-2 font-medium grid grid-cols-1 transition-all ${currentStep === step.id
                    ? "text-gray-700"
                    : currentStep > step.id
                      ? "text-gray-700"
                      : "text-gray-400"
                  }`}
              >
                {step.label} <strong>{step.name}</strong>
              </div>
            </div>
            {/* Линия между шагами */}
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-1 mr-2 transition-all duration-300 ${currentStep > step.id ? "bg-[#00a359]" : "bg-gray-200"
                  }`}
              ></div>
            )}
          </div>
        ))}
      </div>

      {/* Кнопка PDF */}
      <button
        className="ml-auto bg-white text-white px-4 py-3 rounded-xl border border-[#e9e9eb] flex items-center transition"
        onClick={() => setShowModal(true)}
      >
        <img src={PdfIcon} alt="PDF" className="w-10 h-10" />
      </button>

      {/* Модальное окно PDF */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white max-w-3xl w-full relative">
            {/* Закрыть модальное окно */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              <XCircle className="stroke-1 w-7 h-7" />
            </button>
            {/* PDF Viewer или заглушка */}
            <div className="overflow-hidden w-full flex justify-center p-2">
              {pdfUrl ? (
                <Document
                  file={pdfUrl}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  className="flex flex-col items-center"
                >
                  {Array.from(new Array(numPages), (_, index) => (
                    <Page key={`page_${index + 1}`} pageNumber={index + 1} width={600} />
                  ))}
                </Document>
              ) : (
                <p className="text-gray-500 text-lg">Файл не найден. Ожидается загрузка...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusBar;
