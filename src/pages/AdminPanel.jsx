import { useState } from "react";
import HeaderAdmin from "../components/Header/HeaderAdmin";
import CandidatesTable from "../components/tables/CandidatesTable";
import TableRole1 from "../components/tables/TableRole1";
import TableRole2 from "../components/tables/TableRole2";
import TableRole3 from "../components/tables/TableRole3";
import UsersTable from "../components/tables/UsersTable";
import EndedTable from "../components/tables/EndedTable";
import ErrorTable from "../components/tables/ErrorTable";

const AdminPanel = () => {
    const [currentTable, setCurrentTable] = useState("default");

    return (
        <div className="bg-[#e4ebf3] w-screen min-h-screen pt-6">
            {/* Хедер с переключением таблиц */}
            <HeaderAdmin currentTable={currentTable} setCurrentTable={setCurrentTable} />

            <div>
                {/* Стартовая таблица с необработанными документами */}
                {currentTable === "default" && <CandidatesTable />}

                {/* Остальные таблицы по выбору пункта в меню */}
                {currentTable === "role1" && <TableRole1 />}
                {currentTable === "role2" && <TableRole2 />}
                {currentTable === "role3" && <TableRole3 />}
                {currentTable === "users" && <UsersTable />}
                {currentTable === "ended" && <EndedTable />}
                {currentTable === "errors" && <ErrorTable />}
            </div>
        </div>
    );
};

export default AdminPanel;
//test