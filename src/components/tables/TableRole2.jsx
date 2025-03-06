import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Pagination from "../Pagination";
import PlanButton from "../PlanButton";
import DecisionButton from "../DecisionButton";
import { BASE_URL } from "../../utils/api"; // путь может меняться в зависимости от структуры проекта

const TableRole2 = () => {
  const navigate = useNavigate();
  const [cadastres, setCadastres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 30;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch(`${BASE_URL}/cadastre`)
      .then((res) => res.json())
      .then((data) => {
        setCadastres(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка загрузки данных: {error.message}</div>;

  const totalData = cadastres.length;
  const paginatedData = cadastres.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Переход к детальному просмотру
  const handleRowClick = (item) => {
    navigate(`/check/${item.cadastreId}`, { state: item });
  };

  // Функция скачивания PDF
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
                  {item.cadastreId}
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
                  {new Date(item.spaceImageDate).toLocaleDateString()}
                </td>
                <td className="py-4 px-2 bg-white text-center w-24 md:w-28">
                  {item.type}
                </td>
                <td className="py-4 px-2 bg-white text-center w-32 md:w-36">
                  {new Date(item.assignDate).toLocaleDateString()}
                </td>
                <td className="py-4 px-2 bg-white text-orange-500 font-semibold text-center w-24 md:w-28">
                  {new Date(item.deadline).toLocaleDateString()}
                </td>
                <td className="py-4 px-6 bg-white text-center">
                  {item.landPlan && (
                    <PlanButton
                      planPdf={item.landPlan}
                      downloadPdf={downloadPdf}
                    />
                  )}
                </td>
                <td className="py-4 px-6 bg-white text-center">
                  {item.governorDecision ? (
                    <DecisionButton
                      decisionPdf={item.governorDecision}
                      downloadPdf={downloadPdf}
                    />
                  ) : (
                    ""
                  )}
                </td>
                <td className="py-4 px-6 bg-white text-center">
                  <span
                    className={`font-semibold ${
                      item.buildingPresence
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {item.buildingPresence ? "BOR" : "YO‘Q"}
                  </span>
                </td>
                <td className="bg-white rounded-r-3xl">
                  <ChevronRight />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
