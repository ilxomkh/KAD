import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@headlessui/react";
import { CloudUpload, File, Trash } from "lucide-react";
import { BASE_URL } from "../utils/api";
import { useAuth } from "../context/AuthContext"; // Импорт useAuth

function FileUploadModal({ isOpen, onClose, onUpload, cadasterId }) {
  // Важно: здесь cadasterId должен быть числовым идентификатором (data.ID),
  // а не строковым cadastreId вида "01:01:0101010:120"
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Получаем актуальный токен из контекста
  const { token } = useAuth();

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

  const handleRemoveFile = () => {
    setFile(null);
    setUploading(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      // Формируем FormData – поле должно называться так, как ожидает сервер (например, "screenshot")
      const formData = new FormData();
      formData.append("screenshot", file);

      // Отправляем PATCH-запрос по корректному URL:
      // Обратите внимание, что cadasterId должен быть числовым идентификатором (data.ID)
      const response = await fetch(`${BASE_URL}/api/cadastre/${cadasterId}/screenshot`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Ошибка при загрузке файла");
      }

      // Создаем временный URL для предпросмотра
      const fileURL = URL.createObjectURL(file);
      // Вызываем колбэк для передачи URL в родительский компонент
      onUpload(fileURL);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Файл не удалось загрузить");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
    >
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full sm:w-1/3">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold cursor-default text-left">
            Faylni yuklang
          </h2>
        </div>

        {/* Область для выбора файла */}
        <label className="border-dashed border-2 border-[#BABBBF] rounded-2xl p-6 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-blue-500 mt-4">
          <CloudUpload className="mb-4" size={20} />
          <p className="text-[#BABBBF]">
            <span className="text-black underline">Yuklash uchun bosing</span>{" "}
            yoki faylni tortib olib keling.
          </p>
          <p className="text-[#BABBBF]">JPG yoki PNG 5MB gacha</p>
          <input type="file" className="hidden" onChange={handleFileChange} />
        </label>

        {/* Отображаем выбранный файл */}
        {file && (
          <div className="mt-6 p-3 bg-[#f7f9fb] rounded-xl flex items-center justify-between">
            <div className="flex gap-4 px-4 items-center">
              <div className="rounded-full bg-white p-2 flex items-center justify-center w-10 h-10">
                <File />
              </div>
              <div>
                <div className="text-black font-medium">{file.name}</div>
                <div className="text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
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

        {/* Кнопки управления */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="bg-[#1477ef] cursor-pointer text-white text-lg font-bold px-4 py-3 w-full rounded-xl hover:bg-blue-600"
          >
            {uploading ? "Yuklanmoqda..." : "Yuklash"}
          </button>
          <button
            onClick={onClose}
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
