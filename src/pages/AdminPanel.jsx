import { useState, useEffect } from "react";
import HeaderAdmin from "../components/Header/HeaderAdmin";
import CandidatesTable from "../components/tables/CandidatesTable";
import TableRole1 from "../components/tables/TableRole1";
import TableRole2 from "../components/tables/TableRole2";
import TableRole3 from "../components/tables/TableRole3";
import TableRole4 from "../components/tables/TableRole4";
import UsersTable from "../components/tables/UsersTable";
import EndedTable from "../components/tables/EndedTable";
import ErrorTable from "../components/tables/ErrorTable";
import { BASE_URL } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import ModerationTable from "../components/tables/ModerationTable";

const AdminPanel = () => {
  const [currentTable, setCurrentTable] = useState("default");
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Новое состояние для хранения количества записей на страницу, приходящего из meta
  const [pageSize, setPageSize] = useState(10);

  const { token } = useAuth();

  useEffect(() => {
    let url = "";

    if (currentTable === "users") {
      // Запрос на список пользователей
      url = `${BASE_URL}/api/users?page=${currentPage}`;
    } else {
      // Запрос на список кадастров
      url = `${BASE_URL}/api/cadastre?page=${currentPage}`;

      // Дополнительные фильтры по статусам
      if (currentTable === "ended") {
        url += "&status=finished";
      } else if (currentTable === "errors") {
        url += "&cadastreError=true";
      } else if (currentTable === "role1" || currentTable === "role4") {
        url += "&status=pending";
      } else if (currentTable === "role2") {
        url += "&status=geometry_fixed";
      } else if (currentTable === "role3") {
        url += "&status=verified";
      } else if (currentTable === "moderation") {
        url += "&status=in_moderation";
      }
    }

    console.log("Запрос по URL:", url);

    if (!token) {
      console.error("Отсутствует токен авторизации");
      return;
    }

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // Смотрим, массив ли это или объект с полем data
        let dataArray =
          currentTable === "users"
            ? Array.isArray(data)
              ? data
              : data.users || data.data || []
            : Array.isArray(data)
            ? data
            : data.data || [];

        // Дополнительная фильтрация для role4 / role1
        if (currentTable === "role4") {
          dataArray = dataArray.filter(
            (item) => item.modda === 7 || item.modda === 9
          );
        } else if (currentTable === "role1") {
          dataArray = dataArray.filter(
            (item) => item.modda !== 7 && item.modda !== 9
          );
        }

        // Сохраняем массив записей в состояние
        setTableData(dataArray);

        // Если API возвращает meta с общим числом элементов, сохраняем totalItems
        if (data.meta && data.meta.total) {
          setTotalItems(data.meta.total);
        } else {
          // Если нет meta, используем длину массива
          setTotalItems(dataArray.length);
        }

        // Если API возвращает meta.pageSize, используем его для пагинации
        if (data.meta && data.meta.pageSize) {
          setPageSize(data.meta.pageSize);
        } else {
          // По умолчанию пусть будет 10, если meta.pageSize не пришёл
          setPageSize(10);
        }
      })
      .catch((error) => console.error("Ошибка загрузки данных:", error));
  }, [currentTable, token, currentPage]);

  return (
    <div className="bg-[#e4ebf3] w-screen min-h-screen pt-6">
      {/* Хедер */}
      <HeaderAdmin
        currentTable={currentTable}
        setCurrentTable={setCurrentTable}
        setTableData={setTableData}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* ТАБЛИЦЫ */}
      <div>
        {currentTable === "default" && (
          <CandidatesTable
            data={tableData}
            totalItems={totalItems}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={pageSize} // <-- передаём pageSize
          />
        )}

        {currentTable === "role1" && (
          <TableRole1
            data={tableData}
            totalItems={totalItems}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={pageSize}
          />
        )}

        {currentTable === "role2" && (
          <TableRole2
            data={tableData}
            totalItems={totalItems}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={pageSize}
          />
        )}

        {currentTable === "role3" && (
          <TableRole3
            data={tableData}
            totalItems={totalItems}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={pageSize}
          />
        )}

        {currentTable === "role4" && (
          <TableRole4
            data={tableData}
            totalItems={totalItems}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={pageSize}
          />
        )}

        {currentTable === "users" && (
          <UsersTable
            data={tableData}
            totalItems={totalItems}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={pageSize}
          />
        )}

        {currentTable === "ended" && (
          <EndedTable
            data={tableData}
            totalItems={totalItems}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={pageSize}
          />
        )}

        {currentTable === "errors" && (
          <ErrorTable
            data={tableData}
            totalItems={totalItems}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={pageSize}
          />
        )}

        {currentTable === "moderation" && (
          <ModerationTable
            data={tableData}
            totalItems={totalItems}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={pageSize}
          />
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
