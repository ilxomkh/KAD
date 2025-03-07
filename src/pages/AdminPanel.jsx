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
import { useAuth } from "../context/AuthContext"; // Импортируем useAuth

const AdminPanel = () => {
  const [currentTable, setCurrentTable] = useState("default");
  const [tableData, setTableData] = useState([]); // Состояние для данных таблицы

  // Получаем актуальный токен из контекста
  const { token } = useAuth();

  // При каждом изменении currentTable выполняется запрос на API для получения всех данных
  useEffect(() => {
    let url = "";
    if (currentTable === "users") {
      url = `${BASE_URL}/api/users`;
    } else {
      url = `${BASE_URL}/api/cadastre`;
    }
    console.log("Запрос при переключении таблиц по URL:", url);

    // Если токен отсутствует, можно не выполнять запрос
    if (!token) {
      console.error("Отсутствует токен авторизации");
      return;
    }

    fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const dataArray =
          currentTable === "users"
            ? (Array.isArray(data) ? data : data.users || data.data || [])
            : (Array.isArray(data) ? data : data.data || []);
        setTableData(dataArray);
      })
      .catch((error) => console.error("Ошибка загрузки данных:", error));
  }, [currentTable, token]);

  return (
    <div className="bg-[#e4ebf3] w-screen min-h-screen pt-6">
      {/* Хедер с переключением таблиц и фильтрацией */}
      <HeaderAdmin
        currentTable={currentTable}
        setCurrentTable={setCurrentTable}
        setTableData={setTableData}
      />

      <div>
        {currentTable === "default" && <CandidatesTable data={tableData} />}
        {currentTable === "role1" && <TableRole1 data={tableData} />}
        {currentTable === "role2" && <TableRole2 data={tableData} />}
        {currentTable === "role3" && <TableRole3 data={tableData} />}
        {currentTable === "role4" && <TableRole4 data={tableData} />}
        {currentTable === "users" && <UsersTable data={tableData} />}
        {currentTable === "ended" && <EndedTable data={tableData} />}
        {currentTable === "errors" && <ErrorTable data={tableData} />}
      </div>
    </div>
  );
};

export default AdminPanel;
