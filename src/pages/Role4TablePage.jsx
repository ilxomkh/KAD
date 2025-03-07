import React, { useState } from "react";
import HeaderUser from "../components/Header/HeaderUser";
import TableRole4 from "../components/tables/TableRole4";

const Role4TablePage = () => {
  const [tableData, setTableData] = useState([]);

  return (
    <div className="min-h-screen w-screen pt-6 bg-[#e4ebf3]">
      <HeaderUser setTableData={setTableData} />
      <div className="mx-auto">
        <TableRole4 data={tableData} />
      </div>
    </div>
  );
};

export default Role4TablePage;
