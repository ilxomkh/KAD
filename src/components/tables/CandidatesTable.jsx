import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, XCircle } from "lucide-react";
import Pagination from "../Pagination";
import PlanButton from "../PlanButton";
import DecisionButton from "../DecisionButton";
import { BASE_URL } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

function CandidatesTable({
  data,
  totalItems,
  currentPage,
  onPageChange,
  itemsPerPage, // <-- получаем количество записей на страницу
}) {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Состояния для модального окна логов
  const [logs, setLogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState(null);

  // Приходит уже нужная страница данных
  const paginatedData = data;

  // Функция для загрузки логов конкретного элемента
  const handleRowClick = async (item) => {
    setLogsError(null);
    setLogsLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/item_logs/by_item/${item.ID}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Loglarni yuklashda xatolik");
      }
      const logsData = await response.json();
      setLogs(logsData);
      setSelectedItem(item);
      setIsModalOpen(true);
    } catch (err) {
      setLogsError(err.message);
    } finally {
      setLogsLoading(false);
    }
  };

  // Функция для скачивания PDF (если нужно)
  const downloadPdf = (url) => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = "document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative">
      <div className="p-6 bg-[#e4ebf3] rounded-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[#f9f9f9] rounded-t-3xl px-6 overflow-hidden border-separate border-spacing-y-3">
            <thead className="bg-[#f9f9f9] text-gray-600 uppercase text-sm md:text-base leading-normal">
              <tr className="border-b cursor-default border-[#F7F9FB]">
                <th className="py-2 px-2 text-center font-medium w-8 sm:w-10 md:w-12"></th>
                <th className="py-2 px-2 text-center font-medium w-40 md:w-48">
                  Kadastr ID
                </th>
                <th className="py-2 px-2 text-center font-medium w-24">
                  Modda
                </th>
                <th className="py-2 px-2 text-center font-medium w-32">
                  Viloyat
                </th>
                <th className="py-2 px-2 text-center font-medium w-32">
                  Tuman
                </th>
                <th className="py-2 px-2 text-center font-medium w-52">
                  Manzil
                </th>
                <th className="py-2 px-2 text-center font-medium w-44">
                  Kosmik surat ID
                </th>
                <th className="py-2 px-2 text-center font-medium w-32">
                  Kosmik surat sanasi
                </th>
                <th className="py-2 px-2 text-center font-medium w-24">
                  Toifa
                </th>
                <th className="py-2 px-2 text-center font-medium w-32">
                  Kelgan sanasi
                </th>
                <th className="py-2 px-2 text-center font-medium w-24">
                  Muddati
                </th>
                <th className="py-2 px-2 text-center font-medium w-32">
                  Hudud rejasi
                </th>
                <th className="py-2 px-2 text-center font-medium w-32">
                  Hokim qarori
                </th>
                <th className="py-2 px-2 text-center font-medium w-32">
                  Statusi
                </th>
                <th className="py-2 px-2 text-end font-medium w-16 sm:w-20 md:w-24"></th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm md:text-base">
              {paginatedData.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="group rounded-3xl border border-gray-300 transition transform cursor-pointer"
                  onClick={() => handleRowClick(item)}
                >
                  {/* Нумерация с учётом страницы и itemsPerPage */}
                  <td className="py-4 px-2 bg-white rounded-l-3xl text-center font-semibold w-8 sm:w-10 md:w-12">
                    {(currentPage - 1) * itemsPerPage + index + 1}.
                  </td>

                  <td className="py-4 px-2 bg-white text-center font-semibold w-40 md:w-48 transition-colors duration-500 group-hover:text-blue-500">
                    {item.cadastreId}
                  </td>
                  <td className="py-4 px-2 bg-white text-center font-bold w-24">
                    {item.modda}
                  </td>
                  <td className="py-4 px-2 bg-white text-center w-32">
                    {item.region}
                  </td>
                  <td className="py-4 px-2 bg-white text-center w-32">
                    {item.district}
                  </td>
                  <td className="py-4 px-2 bg-white text-center w-52">
                    {item.address}
                  </td>
                  <td className="py-4 px-2 bg-white text-center w-44">
                    {item.spaceImageId}
                  </td>
                  <td className="py-4 px-2 bg-white text-center w-32">
                    {item.spaceImageDate
                      ? new Date(item.spaceImageDate).toLocaleDateString()
                      : ""}
                  </td>
                  <td className="py-4 px-2 bg-white text-center w-24">
                    {item.type}
                  </td>
                  <td className="py-4 px-2 bg-white text-center w-32">
                    {item.transferDate
                      ? new Date(item.transferDate).toLocaleDateString()
                      : ""}
                  </td>
                  <td className="py-4 px-2 bg-white text-orange-500 font-semibold text-center w-24">
                    {item.deadline
                      ? new Date(item.deadline).toLocaleDateString()
                      : ""}
                  </td>
                  <td className="py-4 pl-8 bg-white text-center">
                    {item.landPlan && <PlanButton item={item} />}
                  </td>
                  <td className="py-4 pl-8 bg-white text-center">
                    {item.governorDecision && <DecisionButton item={item} />}
                  </td>

                  <td className="py-4 px-2 bg-white text-center">
                    <span className="">
                      {item.status === "geometry_fixed"
                        ? "Surildi"
                        : item.status === "pending"
                        ? "Kutilmoqda"
                        : item.status === "verified"
                        ? "Tekshirildi"
                        : item.status === "finished"
                        ? "Tugallandi"
                        : item.status === "in_moderation"
                        ? "Moderatsiyada"
                        : item.status === "agency_verified"
                        ? "Agentlik Tekshirdi"
                        : item.status}
                    </span>
                  </td>
                  <td className="pl-8 py-7 bg-white rounded-r-3xl">
                    <ChevronRight className="mr-2" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Пагинация */}
        <div className="flex justify-center py-4 bg-[#f9f9f9] rounded-b-3xl">
          <Pagination
            totalItems={totalItems}
            itemsPerPage={itemsPerPage} // <-- берём из пропсов
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </div>
      </div>

      {/* Модальное окно для логов */}
      {isModalOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Панель модального окна */}
          <div className="fixed top-0 dark:text-gray-900 rounded-l-2xl right-0 w-full sm:w-[320px] md:w-[400px] lg:w-[500px] h-full bg-white z-50 shadow-lg flex flex-col">
            <div className="flex items-center justify-between p-4">
              <h2 className="text-lg font-bold">Loglar</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="stroke-1" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {logsLoading ? (
                <div className="text-center">Loglar yuklanmoqda...</div>
              ) : logsError ? (
                <div className="text-center text-red-500">
                  Xato: {logsError}
                </div>
              ) : logs && logs.length > 0 ? (
                logs.map((log, idx) => (
                  <div key={log.id || idx} className="mb-4 p-3">
                    <div className="text-sm text-gray-600 mb-1">
                      {new Date(log.datetime).toLocaleString()}
                    </div>
                    <div className="font-semibold">
                      {log.comment || "Без комментария"}
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      Status: <strong>{log.processedStatus}</strong>
                    </div>
                    <div className="text-sm mt-1">
                      {log.success ? (
                        <span className="text-green-600 font-semibold">
                          Muvofaqiyatli
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold">
                          Xato
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">Loglar yo'q</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CandidatesTable;
