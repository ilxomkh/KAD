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

  useEffect(() => {
    let url = "";
    if (currentTable === "users") {
      url = `${BASE_URL}/api/users`;
    } else {
      url = `${BASE_URL}/api/cadastre`;
      if (currentTable === "ended") {
        url += "?status=finished";
      } else if (currentTable === "errors") {
        // Фильтрация по атрибуту cadastreError
        url += "?cadastreError=true";
      } else if (currentTable === "role1" || currentTable === "role4") {
        // Оба запроса для pending, но фильтрация по modda произойдёт на клиенте
        url += "?status=pending";
      } else if (currentTable === "role2") {
        url += "?status=geometry_fixed";
      } else if (currentTable === "role3") {
        url += "?status=verified";
      }
    }
    console.log("Запрос по URL:", url);
  
    // Если токен отсутствует, прерываем выполнение
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
        let dataArray =
          currentTable === "users"
            ? (Array.isArray(data) ? data : data.users || data.data || [])
            : (Array.isArray(data) ? data : data.data || []);
  
        // Дополнительная фильтрация для pending по полю modda
        if (currentTable === "role4") {
          // Отображаем только записи, где modda равно "7" или "9"
          dataArray = dataArray.filter(
            (item) => item.modda === 7 || item.modda === 9
          );
        } else if (currentTable === "role1") {
          // Отображаем записи, где modda не равен "7" и не равен "9"
          dataArray = dataArray.filter(
            (item) => item.modda !== 7 && item.modda !== 9
          );
        }
        setTableData(dataArray);
      })
      .catch((error) => console.error("Ошибка загрузки данных:", error));
  }, [currentTable, token, setTableData]);
  
  

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
