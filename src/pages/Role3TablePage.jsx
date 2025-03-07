import React, { useState } from "react";
import HeaderUser from "../components/Header/HeaderUser";
import TableRole3 from "../components/tables/TableRole3";

const Role3TablePage = () => {
  const [tableData, setTableData] = useState([]);

  return (
    <div className="min-h-screen w-screen pt-6 bg-[#e4ebf3]">
      <HeaderUser setTableData={setTableData} />
      <div className="mx-auto">
        <TableRole3 data={tableData} />
      </div>
    </div>
  );
};

export default Role3TablePage;
