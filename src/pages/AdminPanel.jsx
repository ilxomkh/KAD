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

// Замените токен на актуальный
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJ1c2VybmFtZSI6InJvb3QiLCJyb2xlIjoiYWRtaW4ifSwiZXhwIjoxNzQxMzQyNjAxLCJpYXQiOjE3NDEzMzkwMDF9.tYra8W6Bl3Gq08GcQiI_CJT7a3URzVUKW_gsI-7fFhI";

const AdminPanel = () => {
  const [currentTable, setCurrentTable] = useState("default");
  const [tableData, setTableData] = useState([]); // Состояние для данных таблицы

  // При каждом изменении currentTable выполняется запрос на API для получения всех данных
  useEffect(() => {
    let url = "";
    if (currentTable === "users") {
      url = `${BASE_URL}/api/users`;
    } else {
      url = `${BASE_URL}/api/cadastre`;
    }
    console.log("Запрос при переключении таблиц по URL:", url);

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
  }, [currentTable]);

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
