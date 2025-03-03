import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Pagination from "../Pagination";
import PlanButton from "../PlanButton";
import DecisionButton from "../DecisionButton";

const BASE_URL =
  "https://virtserver.swaggerhub.com/KABRA0413/super-etirof/1.0.0";

const CandidatesTable = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // Запрашиваем кадастровые данные с API
  useEffect(() => {
    const fetchCadastres = async () => {
      try {
        const response = await fetch(`${BASE_URL}/cadastres`);
        if (!response.ok) {
          throw new Error("Ошибка при загрузке кадастров");
        }
        const cadastres = await response.json();
        setData(cadastres);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCadastres();
  }, []);

  const totalData = data.length;
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRowClick = (item) => {
    // Переход на страницу сравнения с передачей данных записи
    navigate(`/compare/${item.cadastreId}`, { state: item });
  };

  // Функция скачивания PDF-файла
  const downloadPdf = (url) => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = "document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="p-6 bg-[#e4ebf3] rounded-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#f9f9f9] rounded-t-3xl px-6 overflow-hidden border-separate border-spacing-y-3">
          <thead className="bg-[#f9f9f9] text-gray-600 uppercase text-sm md:text-base leading-normal">
            <tr className="border-b cursor-default border-[#F7F9FB]">
              <th className="py-2 px-2 text-center font-medium w-8 sm:w-10 md:w-12"></th>
              <th className="py-2 px-2 text-center font-medium w-40 md:w-48">
                Kadast ID
              </th>
              <th className="py-2 px-2 text-center font-medium w-24">Modda</th>
              <th className="py-2 px-2 text-center font-medium w-32">
                Viloyat
              </th>
              <th className="py-2 px-2 text-center font-medium w-32">Tuman</th>
              <th className="py-2 px-2 text-center font-medium w-52">Manzil</th>
              <th className="py-2 px-2 text-center font-medium w-44">
                Kosmik surat ID
              </th>
              <th className="py-2 px-2 text-center font-medium w-32">
                Kosmik surat sanasi
              </th>
              <th className="py-2 px-2 text-center font-medium w-24">Toifa</th>
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
              <th className="py-2 px-2 text-end font-medium w-16 sm:w-20 md:w-24"></th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm md:text-base">
            {paginatedData.map((item, index) => (
              <tr
                key={item.id}
                className="group rounded-3xl border border-gray-300 transition transform cursor-pointer"
                onClick={() => handleRowClick(item)}
              >
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
                  {new Date(item.spaceImageDate).toLocaleDateString()}
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
                <td className="py-4 px-6 bg-white text-center">
                  {item.landPlan && <PlanButton cadastreId={item.id} />}
                </td>
                <td className="py-4 px-6 bg-white text-center">
                  {item.governorDecision && (
                    <DecisionButton
                      decisionPdf={item.governorDecision}
                      downloadPdf={downloadPdf}
                    />
                  )}
                </td>
                <td className="justify-end flex items-center py-5 bg-white rounded-r-3xl">
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
          totalItems={totalData}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default CandidatesTable;
