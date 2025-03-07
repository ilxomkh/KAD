import React, { useState } from "react";
import HeaderUser from "../components/Header/HeaderUser";
import TableRole2 from "../components/tables/TableRole2";

const Role2TablePage = () => {
  const [tableData, setTableData] = useState([]);

  return (
    <div className="min-h-screen w-screen pt-6 bg-[#e4ebf3]">
      <HeaderUser setTableData={setTableData} />
      <div className="mx-auto">
        <TableRole2 data={tableData} />
      </div>
    </div>
  );
};

export default Role2TablePage;
