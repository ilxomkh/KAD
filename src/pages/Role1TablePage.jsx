import React, { useState } from "react";
import HeaderUser from "../components/Header/HeaderUser";
import TableRole1 from "../components/tables/TableRole1";

const Role1TablePage = () => {
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  return (
    <div className="min-h-screen w-screen pt-6 bg-[#e4ebf3]">
      <HeaderUser
        setTableData={setTableData}
        setTotalItems={setTotalItems}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <div className="mx-auto">
        <TableRole1
          data={tableData}
          totalItems={totalItems}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default Role1TablePage;
