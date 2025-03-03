import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Pagination from "../Pagination";
import PlanButton from "../PlanButton";
import DecisionButton from "../DecisionButton";

const TableRole2 = () => {
  const navigate = useNavigate();

  const totalData = 3000; // Общее количество записей (получается из API)
  const itemsPerPage = 30; // Сколько записей на странице
  const [currentPage, setCurrentPage] = useState(1);

  const data = Array.from({ length: totalData }, (_, i) => ({
    id: i + 1,
    kadasterId: `20:03:41:02:0${i}`,
    modda: "4-modda", // Симуляция того, что у 7-modda нет PDF
    region: "Buxoro",
    district: "Jondor",
    address: "Oqtepa MFY, Do‘stlik k. 12-uy",
    spaceImageId: `ID_103001007A92B${i}`,
    spaceImageDate: "08.04.2018-y",
    category: "Turar",
    arrivalDate: "12.02.2025-y",
    deadline: "10 kun qoldi",
    planPdf: `/api/pdf/plan/${i}`, // Симуляция ссылок на PDF
    decisionPdf:`/api/pdf/decision/${i}`, // У 7-modda нет PDF
    status: i % 2 === 0 ? "BOR" : "YO‘Q",
  }));

  // Фильтруем данные по текущей странице
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRowClick = (item) => {
    navigate(`/check/${item.kadasterId}`, { state: item });
  };

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
    <div className="p-6 bg-[#e4ebf3] rounded-xl">
      {/* Обёртка для горизонтальной прокрутки */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#f9f9f9] rounded-t-3xl px-6 overflow-hidden border-separate border-spacing-y-3">
          <thead className="bg-[#f9f9f9] text-gray-600 uppercase text-sm md:text-base leading-normal">
            <tr className="border-b cursor-default border-[#F7F9FB]">
              <th className="py-2 px-2 text-center font-medium w-8 sm:w-10 md:w-12"></th>
              <th className="py-2 px-2 text-center font-medium w-40 md:w-48 xl:w-56">
                Kadastr ID
              </th>
              <th className="py-2 px-2 text-center font-medium w-24 md:w-28">
                Modda
              </th>
              <th className="py-2 px-2 text-center font-medium w-32 md:w-36">
                Viloyat
              </th>
              <th className="py-2 px-2 text-center font-medium w-32 md:w-36">
                Tuman
              </th>
              <th className="py-2 px-2 text-center font-medium w-52 md:w-60">
                Manzil
              </th>
              <th className="py-2 px-2 text-center font-medium w-44 md:w-52">
                Kosmik surat ID
              </th>
              <th className="py-2 px-2 text-center font-medium w-32 md:w-36">
                Kosmik surat sanasi
              </th>
              <th className="py-2 px-2 text-center font-medium w-24 md:w-28">
                Toifa
              </th>
              <th className="py-2 px-2 text-center font-medium w-32 md:w-36">
                Kelgan sanasi
              </th>
              <th className="py-2 px-2 text-center font-medium w-24 md:w-28">
                Muddati
              </th>
              <th className="py-2 px-2 text-center font-medium w-32 md:w-36">
                Hudud rejasi
              </th>
              <th className="py-2 px-2 text-center font-medium w-32 md:w-36">
                Hokim qarori
              </th>
              <th className="py-2 px-2 text-center font-medium w-32 md:w-36">
                Qurilma
              </th>
              <th className="py-2 px-2 text-end font-medium w-16 sm:w-20 md:w-24"></th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm md:text-base">
            {paginatedData.map((item, index) => (
              <tr
                key={index}
                className="group rounded-3xl border border-gray-300 transition transform cursor-pointer"
                onClick={() => handleRowClick(item)}
              >
                <td className="py-4 px-2 bg-white rounded-l-3xl text-center font-semibold w-8 sm:w-10 md:w-12">
                  {(currentPage - 1) * itemsPerPage + index + 1}.
                </td>
                <td className="py-4 px-2 bg-white text-center font-semibold w-40 md:w-48 transition-colors duration-500 group-hover:text-blue-500">
                  {item.kadasterId}
                </td>
                <td className="py-4 px-2 bg-white text-center font-bold w-24 md:w-28">
                  {item.modda}
                </td>
                <td className="py-4 px-2 bg-white text-center w-32 md:w-36">
                  {item.region}
                </td>
                <td className="py-4 px-2 bg-white text-center w-32 md:w-36">
                  {item.district}
                </td>
                <td className="py-4 px-2 bg-white text-center w-52 md:w-60">
                  {item.address}
                </td>
                <td className="py-4 px-2 bg-white text-center w-44 md:w-52">
                  {item.spaceImageId}
                </td>
                <td className="py-4 px-2 bg-white text-center w-32 md:w-36">
                  {item.spaceImageDate}
                </td>
                <td className="py-4 px-2 bg-white text-center w-24 md:w-28">
                  {item.category}
                </td>
                <td className="py-4 px-2 bg-white text-center w-32 md:w-36">
                  {item.arrivalDate}
                </td>
                <td className="py-4 px-2 bg-white text-orange-500 font-semibold text-center w-24 md:w-28">
                  {item.deadline}
                </td>
                <td className="py-4 px-6 bg-white text-center">
                  {item.planPdf && (
                    <PlanButton
                      planPdf={item.planPdf}
                      downloadPdf={downloadPdf}
                    />
                  )}
                </td>
                <td className="py-4 px-6 bg-white text-center">
                  {item.decisionPdf ? (
                    <DecisionButton
                    decisionPdf={item.decisionPdf}
                    downloadPdf={downloadPdf}
                  />
                  ) : (
                    ""
                  )}
                </td>
                <td
                  className={`py-4 px-6 bg-white font-semibold ${item.status === "BOR" ? "text-green-500" : "text-red-500"
                    }`}
                >
                  {item.status}
                </td>
                <td className="bg-white rounded-r-3xl">
                  <ChevronRight />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Центрирование пагинации */}
      <div className="flex justify-center py-4 bg-[#f9f9f9] rounded-b-3xl">
        <Pagination
          totalItems={totalData}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default TableRole2;
