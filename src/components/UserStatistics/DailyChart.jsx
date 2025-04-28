import React from "react";

const DailyChart = ({ current, norm }) => {
  const extendedMax = Math.ceil(norm * 1.2); // например: 240
  const barPercent = Math.min((current / extendedMax) * 100, 100);

  const steps = Array.from({ length: 7 }, (_, i) =>
    Math.round((extendedMax / 6) * i)
  );

  return (
    <div className="bg-[#f9fafb] px-6 py-4 -mt-4 rounded-2xl w-full">
      {/* Заголовок */}
      <div className="text-sm text-gray-700 mb-2">
        Kunlik norma ({norm} ta):{" "}
        <span className="text-lg font-bold text-gray-900">{current} ta</span>
      </div>

      {/* Прогресс-бар с вертикальными разделами */}
      <div className="relative w-full h-[30px] rounded-lg overflow-hidden bg-gray-200">
        {/* Вертикальные бордера */}

        {/* Зелёный прогресс со скруглением всех углов */}
        <div
          className="absolute left-0 top-0 h-full bg-[#16A34A] transition-all duration-500 rounded-lg"
          style={{
            width: `${barPercent}%`,
          }}
        />
      </div>

      {/* Подписи под шкалой */}
      <div className="flex justify-between text-xs text-gray-400 mt-1 px-[2px]">
        {steps.map((step) => (
          <span key={step}>{step}</span>
        ))}
      </div>
    </div>
  );
};

export default DailyChart;
