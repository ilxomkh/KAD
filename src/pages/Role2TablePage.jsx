import React, { useState } from "react";
import HeaderUser from "../components/Header/HeaderUser";
import TableRole2 from "../components/tables/TableRole2";

const Role2TablePage = () => {
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
        <TableRole2
          data={tableData}
          totalItems={totalItems}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default Role2TablePage;
