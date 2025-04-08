import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Pagination from "../Pagination";
import PlanButton from "../PlanButton";
import DecisionButton from "../DecisionButton";

const ErrorTable = ({ data = [], totalItems, currentPage, onPageChange }) => {
  const navigate = useNavigate();
  const itemsPerPage = 30; // Используется для корректной нумерации записей

  // Обработчик клика по строке таблицы
  const handleRowClick = (item) => {
    navigate(`/agency-review/${item.cadastreId}`, { state: item });
  };

  return (
    <div className="p-6 bg-[#e4ebf3] rounded-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#f9f9f9] rounded-t-3xl px-6 overflow-hidden border-separate border-spacing-y-3">
          <thead className="bg-[#f9f9f9] text-gray-600 uppercase text-sm md:text-base leading-normal">
            <tr className="border-b cursor-default border-[#F7F9FB]">
              <th className="py-2 px-2 text-center font-medium w-8 sm:w-10 md:w-12"></th>
              <th className="py-2 px-2 text-center font-medium w-40 md:w-48 xl:w-56">
                Kadast ID
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
              <th className="py-2 px-2 text-center font-medium w-32 md:w-36">
                Statusi
              </th>
              <th className="py-2 px-2 text-end font-medium w-16 sm:w-20 md:w-24"></th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {data.map((item, index) => (
              <tr
                key={item.id || index}
                className="group rounded-3xl border border-gray-300 transition transform cursor-pointer"
                onClick={() => handleRowClick(item)}
              >
                <td className="py-4 px-1 bg-white rounded-l-3xl text-center font-semibold">
                  {(currentPage - 1) * itemsPerPage + index + 1}.
                </td>
                <td className="py-4 px-1 bg-white text-center font-semibold transition-colors duration-500 group-hover:text-blue-500">
                  {item.cadastreId}
                </td>
                <td className="py-4 px-1 bg-white text-center font-bold">
                  {item.modda}
                </td>
                <td className="py-4 px-1 bg-white text-center">
                  {item.region}
                </td>
                <td className="py-4 px-1 bg-white text-center">
                  {item.district}
                </td>
                <td className="py-4 px-1 bg-white text-center">
                  {item.address}
                </td>
                <td className="py-4 px-1 bg-white text-center">
                  {item.spaceImageId}
                </td>
                <td className="py-4 px-1 bg-white text-center">
                  {new Date(item.spaceImageDate).toLocaleDateString()}
                </td>
                <td className="py-4 px-1 bg-white text-center">
                  {item.type}
                </td>
                <td className="py-4 px-1 bg-white text-center">
                  {new Date(item.assignDate).toLocaleDateString()}
                </td>
                <td className="py-4 px-2 bg-white text-orange-500 font-semibold text-center">
                  {new Date(item.deadline).toLocaleDateString()}
                </td>
                <td className="py-4 pl-4 bg-white text-center">
                  {item.landPlan && <PlanButton item={item} />}
                </td>
                <td className="py-4 pl-4 bg-white text-center">
                  {item.governorDecision && <DecisionButton item={item} />}
                </td>
                <td
                  className={`py-4 px-1 bg-white font-medium ${
                    item.buildingPresence === "exists"
                      ? "text-green-500"
                      : item.buildingPresence === "nonexistent"
                      ? "text-red-500"
                      : item.buildingPresence === "under_construction"
                      ? "text-yellow-500"
                      : "text-gray-500"
                  } text-center`}
                >
                  {item.buildingPresence === "exists"
                    ? "BOR"
                    : item.buildingPresence === "nonexistent"
                    ? "YO'Q"
                    : item.buildingPresence === "under_construction"
                    ? "Qurilish davrida"
                    : item.buildingPresence}
                </td>

                <td className="py-4 px-2 bg-white text-center">
                  <span className="text-red-500">
                    Kadastr Xatoligi
                  </span>
                </td>
                <td className="bg-white pl-8 rounded-r-3xl text-center">
                  <ChevronRight />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center py-4 bg-[#f9f9f9] rounded-b-3xl">
        <Pagination
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default ErrorTable;
