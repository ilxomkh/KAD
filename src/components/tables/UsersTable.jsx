import React, { useState } from "react";
import { ChevronDown, Filter, Plus, LogOut, MoreHorizontal, Eye, Pencil, Trash } from "lucide-react";
import Pagination from "../Pagination";
import ToggleSwitch from "../Toggle";
import ActionDropdown from "../ActionDropdown";


const UsersTable = () => {
  const totalData = 100;
  const itemsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [data, setData] = useState(
    Array.from({ length: totalData }, (_, i) => ({
      id: i + 1,
      userId: Math.floor(Math.random() * 1000000),
      firstName: ["Komron", "Sarvar", "Zilola", "Bekzod", "Nigina"][i % 5],
      lastName: ["Yoqubov", "Xasanov", "Otabeva", "Xayrullayev", "Rustamova"][i % 5],
      middleName: ["Ilhom o'g'li", "Ibrohim o'g'li", "Ravshan qizi", "Farrux o'g'li", "Shokirjon qizi"][i % 5],
      role: `${(i % 3) + 1}-rol`,
      position: "1-toifali mutaxassis",
      status: i % 2 === 0,
      tasksCompleted: (i + 1) * 120,
      joinedDate: "12.02.2025-y",
    }))
  );

  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleStatus = (id) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, status: !item.status } : item
      )
    );
  };
  

  return (
    <div className="p-6 bg-[#e4ebf3] min-h-screen w-screen">
      <div className="mt-4 bg-[#f9f9f9] p-6 rounded-t-3xl ">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-gray-600 text-left uppercase text-md bg-[#f9f9f9]">
              <th className="py-3 px-4">Foydalanuvchi ID</th>
              <th className="py-3 px-4">Ismi</th>
              <th className="py-3 px-4">Familiyasi</th>
              <th className="py-3 px-4">Sharifi</th>
              <th className="py-3 px-4">Roli</th>
              <th className="py-3 px-4">Lavozimi</th>
              <th className="py-3 px-4">Holati</th>
              <th className="py-3 px-4">Bajarilganlar</th>
              <th className="py-3 px-4">Qo‘shilgan sanasi</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>

          <tbody className="text-gray-700 text-md">
            {paginatedData.map((item, index) => (
              <tr key={index} className="group transition rounded-3xl relative">
                <td className="py-6 px-4 bg-white rounded-l-3xl">{item.userId}</td>
                <td className="py-6 px-4 bg-white">{item.firstName}</td>
                <td className="py-6 px-4 bg-white">{item.lastName}</td>
                <td className="py-6 px-4 bg-white">{item.middleName}</td>
                <td className="py-6 px-4 bg-white">{item.role}</td>
                <td className="py-6 px-4 bg-white">{item.position}</td>
                <td className="py-6 px-4 bg-white">
                  <ToggleSwitch status={item.status} onToggle={() => toggleStatus(item.id)} />
                </td>
                <td className="py-6 px-4 bg-white">{item.tasksCompleted}</td>
                <td className="py-6 px-4 bg-white">{item.joinedDate}</td>
                <td className="px-4 bg-white rounded-r-3xl relative">
                <ActionDropdown item={item} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="w-full bg-[#f9f9f9] -mt-3 py-3 rounded-b-3xl">
      <Pagination totalItems={totalData} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
};

export default UsersTable;
