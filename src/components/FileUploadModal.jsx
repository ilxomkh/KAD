import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Импортируем useNavigate
import { Dialog } from "@headlessui/react";
import { CloudUpload, File, Trash, X } from "lucide-react";

function FileUploadModal({ isOpen, onClose, onUpload }) {
  const navigate = useNavigate(); // Инициализируем navigate
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(2);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const allowedTypes = ["image/jpeg", "image/png"];
      if (!allowedTypes.includes(selectedFile.type)) {
        alert("Fayl formati noto‘g‘ri! Faqat JPG yoki PNG yuklash mumkin.");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("Fayl hajmi 5MB dan oshmasligi kerak!");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setUploading(true);
    setTimeLeft(2);

    let progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setUploading(false);
          setTimeLeft(null);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    let timeInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timeInterval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      const fileURL = URL.createObjectURL(file); // Создаем временный URL файла
      onUpload(fileURL); // Передаем фото в `VerdictPage.jsx`
      setUploading(false);
      onClose(); // Закрываем модальное окно
    }, 2000);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploading(false);
    setProgress(0);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
    >
      <div className="bg-white p-6 rounded-2xl shadow-lg w-1/3">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold cursor-default text-left">
            Faylni yuklang
          </h2>
        </div>

        <label className="border-dashed border-2 border-[#BABBBF] rounded-2xl p-6 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-blue-500 mt-4">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mb-4 size-8"
          >
            <path
              d="M1 14V14C1 14.4643 1 14.6965 1.01926 14.8921C1.20631 16.7912 2.70882 18.2937 4.60793 18.4807C4.80349 18.5 5.03566 18.5 5.5 18.5H14.5C14.9643 18.5 15.1965 18.5 15.3921 18.4807C17.2912 18.2937 18.7937 16.7912 18.9807 14.8921C19 14.6965 19 14.4643 19 14V14M1 14V8.7C1 5.70021 1 4.20032 1.76393 3.14886C2.01065 2.80928 2.30928 2.51065 2.64886 2.26393C3.70032 1.5 5.20021 1.5 8.2 1.5H11.8C14.7998 1.5 16.2997 1.5 17.3511 2.26393C17.6907 2.51065 17.9893 2.80928 18.2361 3.14886C19 4.20032 19 5.70021 19 8.7V14M1 14L3.28731 10.7978C4.26497 9.42905 4.7538 8.74468 5.37713 8.5404C5.78179 8.40777 6.21821 8.40777 6.62287 8.5404C7.2462 8.74468 7.73503 9.42905 8.71269 10.7978L9.21995 11.5079C9.59232 12.0292 9.7785 12.2899 9.97811 12.4555C10.6242 12.9916 11.5364 13.0671 12.2619 12.6445C12.486 12.514 12.7125 12.2875 13.1655 11.8345V11.8345C13.5562 11.4438 13.7516 11.2484 13.9512 11.1255C14.5943 10.7294 15.4057 10.7294 16.0488 11.1255C16.2484 11.2484 16.4438 11.4438 16.8345 11.8345L19 14M16 6.25C16 7.2165 15.2165 8 14.25 8C13.2835 8 12.5 7.2165 12.5 6.25C12.5 5.2835 13.2835 4.5 14.25 4.5C15.2165 4.5 16 5.2835 16 6.25Z"
              stroke="#222432"
              stroke-width="1.5"
              stroke-linejoin="round"
            />
          </svg>
          <p className="text-[#BABBBF]">
            <span className="text-black underline">Yuklash uchun bosing</span>{" "}
            yoki faylni tortib olib keling.
          </p>
          <p className="text-[#BABBBF]">JPG yoki PNG 5MB gacha</p>
          <input type="file" className="hidden" onChange={handleFileChange} />
        </label>

        {file && (
          <div className="mt-6 p-3 bg-[#f7f9fb] rounded-xl flex items-center justify-between">
            <div className="flex gap-4 px-4 items-center">
              <div className="rounded-full bg-white p-2 flex items-center justify-center w-10 h-10">
                <File />
              </div>
              <div>
                <div className="text-black font-medium">{file.name}</div>
                <div className="text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB{" "}
                </div>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="rounded-full bg-white p-2 flex items-center justify-center w-10 h-10 text-red-500 hover:text-red-700"
            >
              <Trash size={20} />
            </button>
          </div>
        )}

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="bg-[#1477ef] cursor-pointer text-white text-lg font-bold px-4 py-3 w-full rounded-xl hover:bg-blue-600"
          >
            {uploading ? "Yuklanmoqda..." : "Yuklash"}
          </button>
          <button
            onClick={() => navigate("/")} // Теперь кнопка "Orqaga" отправляет на "/"
            className="bg-[#f7f9fb] cursor-pointer border text-lg font-bold border-[#E9E9EB] px-4 py-3 w-full rounded-xl hover:bg-gray-100"
          >
            Orqaga
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export default FileUploadModal;
