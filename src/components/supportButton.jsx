import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Импортируем useNavigate
import headphoneIcon from "../assets/headphone.svg"; // <-- Импорт вашего SVG-файла
import { BASE_URL } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const SupportButton = ({ cadastreId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate(); // Инициализируем navigate

  // Открыть модальное окно
  const handleOpenModal = () => {
    console.log("SupportButton: Open modal for cadastreId:", cadastreId);
    setIsModalOpen(true);
  };

  // Закрыть модальное окно
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Обработчик подтверждения
  const handleConfirm = async () => {
    const url = `${BASE_URL}/api/cadastre/${cadastreId}/into_moderation`;
    const payload = { message: "string" };
    console.log("SupportButton: Sending PATCH request to:", url);
    console.log("SupportButton: Payload:", payload);
    console.log("SupportButton: Token:", token);

    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("SupportButton: Received response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("SupportButton: Error response body:", errorText);
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }

      console.log("SupportButton: Успешно отправлено в модерацию!");
      handleCloseModal();
      navigate("/"); // Переход на главную страницу
    } catch (error) {
      console.error("SupportButton: Ошибка при отправке в модерацию:", error);
      // Здесь можно добавить UI-уведомление об ошибке
    }
  };

  return (
    <div className="relative">
      {/* Кнопка для вызова модального окна */}
      <button
        onClick={handleOpenModal}
        className={`w-12 h-12 flex items-center group justify-center rounded-xl bg-white transition
          ${
            isModalOpen
              ? "border border-blue-500 text-blue-500"
              : "border border-white text-gray-800"
          }
          hover:bg-blue-100 hover:border-blue-500 hover:text-blue-500
          active:bg-blue-200 active:border-blue-600 active:text-blue-600
        `}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          shapeRendering="geometricPrecision"
          textRendering="geometricPrecision"
          imageRendering="optimizeQuality"
          fillRule="evenodd"
          clipRule="evenodd"
          viewBox="0 0 470 511.814"
          className="w-6 h-6 group-hover:fill-blue-500 transition-colors duration-300"
        >
          <path d="M24.081 419.528v-78.442c-5.062-13.064-6.923-30.396-7.292-49.72h-3.48C4.768 154.593 92.027 50.987 235.259 51.007c143.197.019 230.407 103.623 221.867 240.359h-3.914c-.369 19.324-2.231 36.656-7.292 49.72v78.442c14.717-16.669 20.313-62.056 24.08-128.162h-3.644C488.628 139.03 404.041.008 235.237 0 66.413-.008-16.792 138.735 4.079 291.366H0c3.768 66.106 9.364 111.493 24.081 128.162zm84.061-153.895h-5.813v237.726h5.813a6.226 6.226 0 004.406-1.837 6.224 6.224 0 001.837-4.406V271.877c0-3.429-2.819-6.244-6.243-6.244zm253.717-8.455h17.496c19.499 0 40.879 15.913 40.879 36.538v1.896h3.302c8.819 0 16.043 7.23 16.043 16.041v145.683c0 8.805-7.238 16.042-16.043 16.042h-3.302v1.9c0 20.63-21.376 36.536-40.879 36.536h-17.496c-8.094 0-14.699-6.605-14.699-14.698v-.135h-9.88c-11.083 0-20.153-9.07-20.153-20.155v-184.66c0-11.084 9.068-20.155 20.153-20.155h9.88c0-8.15 6.516-14.833 14.699-14.833zm-239.018 14.833h9.88c11.085 0 20.153 9.071 20.153 20.155v184.66c0 11.085-9.07 20.155-20.153 20.155h-9.88v.135c0 4.046-1.654 7.724-4.314 10.385a14.664 14.664 0 01-10.385 4.313H90.645c-10.188 0-20.675-4.275-28.424-11.105-7.446-6.564-12.454-15.525-12.454-25.431v-1.9h-3.303c-4.388 0-8.392-1.8-11.305-4.7l-.018-.019c-2.914-2.921-4.719-6.929-4.719-11.323V311.653c0-8.813 7.223-16.041 16.042-16.041h3.303v-1.896c0-20.625 21.38-36.538 40.878-36.538h17.497c8.066 0 14.699 6.624 14.699 14.699v.134zm-29.238-6.378h-2.958c-14.788 0-32.423 12.176-32.423 28.083v6.124a4.229 4.229 0 01-4.228 4.228h-7.53c-4.174 0-7.587 3.417-7.587 7.585v145.683c0 2.092.85 3.989 2.216 5.354l.018.017a7.547 7.547 0 005.353 2.217h7.53a4.228 4.228 0 014.228 4.227v6.127c0 7.293 3.853 14.037 9.581 19.088 6.276 5.529 14.707 8.993 22.842 8.993h2.958V265.633zm282.795 0v237.726h2.957c14.792 0 32.424-12.171 32.424-28.081v-6.127a4.228 4.228 0 014.228-4.227h7.529c4.185 0 7.588-3.404 7.588-7.588V311.653c0-4.168-3.413-7.585-7.588-7.585h-7.529a4.229 4.229 0 01-4.228-4.228v-6.124c0-15.907-17.635-28.083-32.424-28.083h-2.957zm-8.727 237.726V265.633h-5.812c-3.424 0-6.244 2.815-6.244 6.244v225.239c0 3.425 2.818 6.243 6.244 6.243h5.812z" />
        </svg>{" "}
      </button>

      {/* Модальное окно */}
      {isModalOpen && (
        <>
          {/* Контейнер модального окна */}
          <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50 pointer-events-auto">
            <div className="bg-white px-4 py-2 rounded-2xl shadow-lg max-w-md w-full text-left relative">
              <h2 className="text-lg dark:text-gray-900 cursor-default font-semibold mb-4">
                Moderatsiyaga jo'natishni tasdiqlaysizmi?
              </h2>
              <div className="flex justify-center w-full space-x-4">
                <button
                  className="px-6 py-3 w-full cursor-pointer bg-blue-500 text-white rounded-xl transition-all hover:bg-blue-600"
                  onClick={handleConfirm}
                >
                  Ha
                </button>
                <button
                  className="px-6 py-3 w-full cursor-pointer bg-[#f7f9fb] border border-[#e9e9eb] text-gray-700 rounded-xl transition-all hover:bg-gray-100"
                  onClick={handleCloseModal}
                >
                  Yo'q
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SupportButton;
