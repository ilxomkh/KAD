import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Filter,
  Plus,
  LogOut,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash,
} from "lucide-react";
import Pagination from "../Pagination";
import ToggleSwitch from "../Toggle";
import ActionDropdown from "../ActionDropdown";

// Определяем базовый URL.
// Для локальной разработки используется "http://localhost:8080/api",
// для продакшена можно установить переменную окружения REACT_APP_BASE_URL.
const BASE_URL =
  "https://virtserver.swaggerhub.com/KABRA0413/super-etirof/1.0.0";

const UsersTable = () => {
  const itemsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Получаем данные с API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/users`);
        if (!response.ok) {
          throw new Error("Ошибка сети");
        }
        const users = await response.json();
        setData(users);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Переключение статуса пользователя
  const toggleStatus = (id) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      )
    );
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="p-6 bg-[#e4ebf3] min-h-screen w-screen">
      <div className="mt-4 bg-[#f9f9f9] p-6 rounded-t-3xl ">
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
            {paginatedData.map((item) => (
              <tr
                key={item.id}
                className="group transition rounded-3xl cursor-pointer relative"
              >
                <td className="py-6 px-4 bg-white rounded-l-3xl">{item.id}</td>
                <td className="py-6 px-4 bg-white">{item.firstName}</td>
                <td className="py-6 px-4 bg-white">{item.lastName}</td>
                <td className="py-6 px-4 bg-white">{item.middleName}</td>
                <td className="py-6 px-4 bg-white">{item.role}</td>
                <td className="py-6 px-4 bg-white">{item.position}</td>
                <td className="py-6 px-4 bg-white">
                  <ToggleSwitch
                    userId={item.id}
                    initialStatus={item.active}
                    onToggle={() => toggleStatus(item.id)}
                  />
                </td>
                <td className="py-6 px-4 bg-white">{item.tasksCompleted}</td>
                <td className="py-6 px-4 bg-white">{item.tasksFailed}</td>
                <td className="py-6 px-4 bg-white">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : ""}
                </td>
                <td className="px-4 bg-white rounded-r-3xl relative">
                  <ActionDropdown item={item} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center py-4 bg-[#f9f9f9] rounded-b-3xl">
        <Pagination
          totalItems={data.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default UsersTable;
