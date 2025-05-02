import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import dayjs from "dayjs";

const WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export default function CustomDatePicker({
  selected,
  onSelect,
  fromYear = 2023,
  toYear = 2030,
}) {
  const [view, setView] = useState("month"); // "month" или "year"
  const [cursor, setCursor] = useState(
    selected ? dayjs(selected) : dayjs()
  );

  // дни текущего месяца
  const startOfMonth = cursor.startOf("month");
  const daysInMonth = startOfMonth.daysInMonth();
  const days = Array.from({ length: daysInMonth }, (_, i) =>
    startOfMonth.add(i, "day")
  );

  // список годов
  const years = [];
  for (let y = fromYear; y <= toYear; y++) years.push(y);

  return (
    <div className="w-64 bg-white p-4 rounded-lg shadow-lg">
      {/* Заголовок: месяц/год + стрелки */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setView((v) => (v === "month" ? "year" : "month"))}
          className="flex items-center text-gray-800 font-medium"
        >
          {cursor.format("MMMM YYYY")}
          {view === "month" ? (
            <ChevronDown className="ml-1 w-4 h-4" />
          ) : (
            <ChevronUp className="ml-1 w-4 h-4" />
          )}
        </button>
        {view === "month" && (
          <div className="flex space-x-2">
            <button
              onClick={() => setCursor((c) => c.subtract(1, "month"))}
              className="p-1 rounded hover:bg-gray-100"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={() => setCursor((c) => c.add(1, "month"))}
              className="p-1 rounded hover:bg-gray-100"
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* Сама сетка */}
      {view === "month" ? (
        <>
          <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
            {WEEK_DAYS.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {days.map((d) => {
              const isSelected =
                selected && dayjs(selected).isSame(d, "day");
              return (
                <button
                  key={d.format()}
                  onClick={() => onSelect(d.toDate())}
                  className={`py-1 rounded-full transition ${
                    isSelected
                      ? "bg-blue-500 text-white"
                      : "hover:bg-blue-100"
                  }`}
                >
                  {d.date()}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        // Вид списка годов
        <div className="grid grid-cols-3 gap-2">
          {years.map((y) => {
            const isActive =
              selected && dayjs(selected).year() === y;
            return (
              <button
                key={y}
                onClick={() => {
                  // сохраняем выбранный год, но оставляем день/месяц
                  const newDate = selected
                    ? dayjs(selected).year(y)
                    : dayjs().year(y);
                  onSelect(newDate.toDate());
                  setView("month");
                }}
                className={`py-1 px-2 rounded-full transition ${
                  isActive
                    ? "bg-blue-100 text-blue-800"
                    : "hover:bg-gray-100"
                }`}
              >
                {y}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
