import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Pagination from "../Pagination";
import ToggleSwitch from "../Toggle";
import ActionDropdown from "../ActionDropdown";

const UsersTable = ({ data = [], totalItems, currentPage, onPageChange }) => {
  const navigate = useNavigate();
  const itemsPerPage = 12; // Количество элементов на страницу

  // Пример функции для переключения статуса пользователя
  const toggleStatus = (id) => {
    // Здесь можно сделать запрос к API для обновления статуса,
    // а затем вызвать onPageChange или другой callback для обновления данных.
    console.log("Toggle status for user", id);
  };

  if (!data.length) return <div>Данные не найдены</div>;

  return (
    <div className="p-6 bg-[#e4ebf3] w-screen">
      <div className="mt-4 bg-[#f9f9f9] p-6 rounded-t-3xl">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-gray-600 cursor-default text-left uppercase text-md bg-[#f9f9f9]">
              <th className="py-3 px-4 text-center">Foydalanuvchi ID</th>
              <th className="py-3 px-4 text-center">Ismi</th>
              <th className="py-3 px-4 text-center">Familiyasi</th>
              <th className="py-3 px-4 text-center">Sharifi</th>
              <th className="py-3 px-4 text-center">Roli</th>
              <th className="py-3 px-4 text-center">Lavozimi</th>
              <th className="py-3 px-4 text-center">Holati</th>
              <th className="py-3 px-4 text-center">Bajarilganlar</th>
              <th className="py-3 px-4 text-center">Xatoliklar</th>
              <th className="py-3 px-4 text-center">Qo‘shilgan sanasi</th>
              <th className="py-3 px-4 text-center"></th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-md">
            {data.map((item, index) => {
              const userId = item.id || item._id || item.userId;
              return (
                <tr
                  key={userId || index}
                  className="group transition rounded-3xl cursor-pointer relative"
                >
                  <td className="py-6 px-4 text-center bg-white rounded-l-3xl">
                    {item.ID}
                  </td>
                  <td className="py-6 px-4 bg-white text-center">
                    {item.firstName}
                  </td>
                  <td className="py-6 px-4 bg-white text-center">
                    {item.lastName}
                  </td>
                  <td className="py-6 px-4 bg-white text-center">
                    {item.middleName}
                  </td>
                  <td className="py-6 px-4 bg-white text-blue-500 text-center">
                    {item.role === "geometry_fix"
                      ? "1-rol"
                      : item.role === "verify"
                      ? "2-rol"
                      : item.role === "agency"
                      ? "3-rol"
                      : item.role === "verdict_79"
                      ? "4-rol(7-9)"
                      : item.role === "cadastre_integration"
                      ? "Kadastr Xodimi"
                      : item.role === "admin"
                      ? "Adminstrator"
                      : item.role}
                  </td>
                  <td className="py-6 px-4 bg-white text-center">
                    {item.position}
                  </td>
                  <td className="py-6 pl-16 bg-white text-center">
                    <ToggleSwitch
                      userId={item.ID}
                      initialStatus={item.active}
                      onToggle={() => toggleStatus(item.ID)}
                    />
                  </td>
                  <td className="py-6 px-4 bg-white text-center">
                    {item.tasksCompleted}
                  </td>
                  <td
                    className={`py-6 px-4 text-center bg-white ${
                      item.tasksFailed === 0 ? "text-green-500" : "text-red-600"
                    }`}
                  >
                    {item.tasksFailed}
                  </td>{" "}
                  <td className="py-6 px-4 text-center bg-white">
                    {item.CreatedAt
                      ? new Date(item.CreatedAt).toLocaleDateString()
                      : ""}
                  </td>
                  <td className="px-4 bg-white rounded-r-3xl relative">
                    <ActionDropdown item={item} />
                  </td>
                </tr>
              );
            })}
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

export default UsersTable;
