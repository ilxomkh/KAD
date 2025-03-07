import React, { useState, useEffect } from "react";
import Pagination from "../Pagination";
import ToggleSwitch from "../Toggle";
import ActionDropdown from "../ActionDropdown";

const UsersTable = ({ data = [] }) => {
  // Локальное состояние для данных внутри таблицы
  const [localData, setLocalData] = useState(data);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Когда проп data меняется, синхронизируем локальное состояние
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // Функция переключения статуса пользователя
  const toggleStatus = (id) => {
    setLocalData((prevData) =>
      prevData.map((item) =>
        (item.id || item._id || item.userId) === id
          ? { ...item, active: !item.active }
          : item
      )
    );
  };

  // Пагинация
  const paginatedData = localData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!localData.length) return <div>Данные не найдены</div>;

  return (
    <div className="p-6 bg-[#e4ebf3] min-h-screen w-screen">
      <div className="mt-4 bg-[#f9f9f9] p-6 rounded-t-3xl">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-gray-600 cursor-default text-left uppercase text-md bg-[#f9f9f9]">
              <th className="py-3 px-4">Foydalanuvchi ID</th>
              <th className="py-3 px-4">Ismi</th>
              <th className="py-3 px-4">Familiyasi</th>
              <th className="py-3 px-4">Sharifi</th>
              <th className="py-3 px-4">Roli</th>
              <th className="py-3 px-4">Lavozimi</th>
              <th className="py-3 px-4">Holati</th>
              <th className="py-3 px-4">Bajarilganlar</th>
              <th className="py-3 px-4">Xatoliklar</th>
              <th className="py-3 px-4">Qo‘shilgan sanasi</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-md">
            {paginatedData.map((item, index) => {
              const userId = item.id || item._id || item.userId;
              return (
                <tr
                  key={userId || index}
                  className="group transition rounded-3xl cursor-pointer relative"
                >
                  <td className="py-6 px-4 bg-white rounded-l-3xl">{item.ID}</td>
                  <td className="py-6 px-4 bg-white">{item.firstName}</td>
                  <td className="py-6 px-4 bg-white">{item.lastName}</td>
                  <td className="py-6 px-4 bg-white">{item.middleName}</td>
                  <td className="py-6 px-4 bg-white">{item.role}</td>
                  <td className="py-6 px-4 bg-white">{item.position}</td>
                  <td className="py-6 px-4 bg-white">
                    <ToggleSwitch
                      userId={item.ID}
                      initialStatus={item.active}
                      onToggle={() => toggleStatus(item.ID)}
                    />
                  </td>
                  <td className="py-6 px-4 bg-white">{item.tasksCompleted}</td>
                  <td className="py-6 px-4 bg-white">{item.tasksFailed}</td>
                  <td className="py-6 px-4 bg-white">
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
          totalItems={localData.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default UsersTable;
