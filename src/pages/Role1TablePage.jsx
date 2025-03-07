import React, { useState } from "react";
import HeaderUser from "../components/Header/HeaderUser";
import TableRole1 from "../components/tables/TableRole1";

const Role1TablePage = () => {
  const [tableData, setTableData] = useState([]);

  return (
    <div className="min-h-screen w-screen pt-6 bg-[#e4ebf3]">
      <HeaderUser setTableData={setTableData} />
      <div className="mx-auto">
        <TableRole1 data={tableData} />
      </div>
    </div>
  );
};

export default Role1TablePage;
