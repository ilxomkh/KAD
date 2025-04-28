import { useState, useEffect } from "react";
import axios from "axios"; // 👈 обязательно импортировать!
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
import SendedTable from "../components/tables/SendedTable";
import Statistics from "../components/Statistics/Statistics";

const AdminPanel = () => {
  const [currentTable, setCurrentTable] = useState("default");
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { token, refreshTokenRequest, logout } = useAuth();

  const moddaValues = [4, 5, 6, 8];
  const moddaQuery = moddaValues.map((value) => `modda=${value}`).join("&");

  const moddaValues79 = [7, 9];
  const modda79Query = moddaValues79.map((value) => `modda=${value}`).join("&");

  const fetchData = async () => {
    if (!token) {
      console.error("Отсутствует токен авторизации");
      return;
    }

    let url = "";

    if (currentTable === "users") {
      url = `${BASE_URL}/api/users?page=${currentPage}`;
    } else {
      url = `${BASE_URL}/api/cadastre?page=${currentPage}`;
      if (currentTable === "ended") {
        url += "&status=finished";
      } else if (currentTable === "errors") {
        url += "&cadastreError=true";
      } else if (currentTable === "role1") {
        url += `&status=pending&${moddaQuery}`;
      } else if (currentTable === "role2") {
        url += "&status=geometry_fixed";
      } else if (currentTable === "role3") {
        url += "&status=verified";
      } else if (currentTable === "sended") {
        url += "&status=agency_verified";
      } else if (currentTable === "moderation") {
        url += "&status=in_moderation";
      } else if (currentTable === "role4") {
        url += `&status=pending&${modda79Query}`;
      }
    }

    console.log("Запрос по URL:", url);

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      let dataArray =
        currentTable === "users"
          ? Array.isArray(data)
            ? data
            : data.users || data.data || []
          : Array.isArray(data)
          ? data
          : data.data || [];

      setTableData(dataArray);

      if (data.meta && data.meta.total) {
        setTotalItems(data.meta.total);
      } else {
        setTotalItems(dataArray.length);
      }

      if (data.meta && data.meta.pageSize) {
        setPageSize(data.meta.pageSize);
      } else {
        setPageSize(10);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.warn("Получили 401 — пробуем обновить токен...");
        try {
          await refreshTokenRequest(); // Обновляем токен
          await fetchData(); // Повторно запрашиваем данные
        } catch (refreshError) {
          console.error("Не удалось обновить токен:", refreshError);
          logout();
        }
      } else {
        console.error("Ошибка загрузки данных:", error);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentTable, token, currentPage]);

  return (
    <div className="bg-[#e4ebf3] w-screen min-h-screen pt-6">
      <HeaderAdmin
        currentTable={currentTable}
        setCurrentTable={setCurrentTable}
        setTableData={setTableData}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <div>
        {currentTable === "statistics" && <Statistics />}
        {currentTable === "default" && (
          <CandidatesTable
            data={tableData}
            totalItems={totalItems}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={pageSize}
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
        {currentTable === "sended" && (
          <SendedTable
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
