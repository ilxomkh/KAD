import React from "react";
import { useState, useEffect } from "react";
import { FaFilePdf } from "react-icons/fa";
import { BASE_URL } from "../utils/api";
import { useAuth } from "../context/AuthContext";

// Функция для форматирования дат
const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("uz-UZ");
};

export default function CadastreInfo({ cadastreId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null);
  const { token } = useAuth();

  // Запрос данных при открытии модального окна
  useEffect(() => {
    if (isOpen && cadastreId && token) {
      const encodedCadastreId = encodeURIComponent(cadastreId);
      fetch(`${BASE_URL}/api/cadastre/${encodedCadastreId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((json) => setData(json))
        .catch((err) => console.error(err));
    }
  }, [isOpen, cadastreId, token]);

  // Преобразование ключей для более понятного отображения
  const transformKey = (key) => {
    const mapping = {
      cadastreId: "Kadastr ID",
      region: "Viloyat",
      district: "Tuman",
      neighborhood: "Mahalla",
      soato: "Soato",
      address: "Manzil",
      modda: "Modda",
      type: "Toifa",
      assignDate: "Kelgan sanasi",
      deadline: "Muddati",
      spaceImageId: "Kosmik surat ID",
      spaceImageDate: "Kosmik surat sanasi",
      landPlan: "Reja",
      governorDecision: "Qaror",
      CreatedAt: "Yaratilgan sana",
      UpdatedAt: "Yangilangan sana",
      DeletedAt: "O‘chirilgan sana",
    };
    return mapping[key] || key;
  };

  // Форматирование значения, если это дата
  const formatValue = (key, value) => {
    const dateKeys = [
      "assignDate",
      "deadline",
      "spaceImageDate",
      "CreatedAt",
      "UpdatedAt",
      "DeletedAt",
    ];
    if (dateKeys.includes(key)) {
      return formatDate(value);
    }
    return value.toString();
  };

  return (
    <div className="flex items-center justify-center">
      {/* Кнопка для открытия модального окна */}
      <button
        className={`w-12 h-12 flex items-center justify-center rounded-xl bg-white transition 
          ${
            isOpen
              ? "border-1 border-blue-500 text-blue-500"
              : "border-1 border-white text-gray-800"
          }
          hover:bg-blue-100 hover:border-blue-500 hover:text-blue-500
          active:bg-blue-200 active:border-blue-600 active:text-blue-600`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-colors duration-100"
        >
          <path
            d="M16 16.3333V20.3333M28 16C28 22.6274 22.6274 28 16 28C9.37258 28 4 22.6274 4 16C4 9.37258 9.37258 4 16 4C22.6274 4 28 9.37258 28 16Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17.3334 12.0001C17.3334 12.7365 16.7364 13.3334 16 13.3334C15.2636 13.3334 14.6667 12.7365 14.6667 12.0001C14.6667 11.2637 15.2636 10.6667 16 10.6667C16.7364 10.6667 17.3334 11.2637 17.3334 12.0001Z"
            fill="currentColor"
          />
        </svg>
      </button>

      {/* Модальное окно */}
      {isOpen && (
        <div
          className="absolute -left-96 top-14 inset-0 z-50 bg-black/20"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white px-6 py-4 rounded-2xl max-w-[444px] w-full max-h-[472px] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Заголовок */}
            <div className="sticky -top-4 bg-white py-3 z-10">
              <h2 className="text-xl font-semibold text-gray-900">
                Nomzodning ma'lumotlari
              </h2>
            </div>

            {/* Контент */}
            <div className="py-3 text-gray-800">
              {data && Object.keys(data).length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(data).map(([key, value]) => {
                    // Пропускаем ненужные атрибуты
                    if (
                      ["fixedGeojson", "screenshot", "geojson"].includes(key) ||
                      value === null ||
                      value === undefined ||
                      value === ""
                    )
                      return null;

                    // Специальная обработка для ссылок на PDF
                    if (
                      (key === "landPlan" || key === "governorDecision") &&
                      typeof value === "string" &&
                      (value.startsWith("http://") ||
                        value.startsWith("https://"))
                    ) {
                      const label = transformKey(key);
                      return (
                        <React.Fragment key={key}>
                          {/* Заголовок слева (например, "Reja" или "Qaror") */}
                          <p className="font-medium text-gray-500">{label}</p>
                          {/* Ссылка только с иконкой PDF */}
                          <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-blue-600 hover:underline"
                          >
                            <FaFilePdf className="text-red-500" />
                            {/* Убрали текстовое название файла */}
                          </a>
                        </React.Fragment>
                      );
                    }

                    return (
                      <React.Fragment key={key}>
                        <p className="font-medium text-gray-500">
                          {transformKey(key)}
                        </p>
                        <p className="text-gray-900">
                          {formatValue(key, value)}
                        </p>
                      </React.Fragment>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
