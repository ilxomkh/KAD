import React, { useState, useEffect } from "react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import FilterButton from "./FilterButton";
import LogoutButton from "./LogoutButton";
import FilterModal from "../FilterModal";
import { BASE_URL } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const HeaderUser = ({ setTableData, setTotalItems, currentPage, setCurrentPage }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { token } = useAuth();

  // 🔁 Загрузка всех данных со всех страниц
  const fetchAllCadastreData = async () => {
    let allData = [];
    let page = 1;
    let totalPages = 1;

    try {
      while (page <= totalPages) {
        const res = await fetch(`${BASE_URL}/api/cadastre?page=${page}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const rawText = await res.text();
        let data;
        try {
          data = JSON.parse(rawText);
        } catch (e) {
          throw new Error("Ошибка парсинга JSON: " + e.message);
        }

        const pageData = Array.isArray(data.data) ? data.data : [];
        allData = [...allData, ...pageData];
        totalPages = data.meta?.totalPages || 1;
        page++;
      }
    } catch (error) {
      console.error("Ошибка загрузки всех кадастров:", error);
    }

    return allData;
  };

  // 🔍 Поиск по всем данным
  const handleSearch = async (query) => {
    setCurrentPage(1);
    const searchLower = query.trim().toLowerCase();

    try {
      const allData = await fetchAllCadastreData();
      const filteredData = allData.filter((item) =>
        item.cadastreId?.toLowerCase().includes(searchLower)
      );

      setTableData(filteredData);
      setTotalItems(filteredData.length);
    } catch (error) {
      console.error("[handleSearch] Ошибка:", error);
      setTableData([]);
      setTotalItems(0);
    }
  };

  // 🎯 Фильтрация по всем данным
  const handleFilterApply = async (filters) => {
    setCurrentPage(1);

    try {
      const allData = await fetchAllCadastreData();

      const filteredData = allData.filter((item) => {
        const matchModda =
          !filters.modda || item.modda?.toString() === filters.modda.replace("-modda", "");
        const matchRegion = !filters.region || item.region === filters.region;
        const matchDeadline =
          !filters.deadline ||
          new Date(item.assignDate).getDate() === Number(filters.deadline);
        const matchType = !filters.type || item.type === filters.type;
        return matchModda && matchRegion && matchDeadline && matchType;
      });

      setTableData(filteredData);
      setTotalItems(filteredData.length);
    } catch (error) {
      console.error("[handleFilterApply] Ошибка:", error);
    }
  };

  // 📦 Загрузка текущей страницы по умолчанию (пагинация)
  useEffect(() => {
    const loadData = async () => {
      const url = `${BASE_URL}/api/cadastre?page=${currentPage}`;
      console.log("===== [useEffect - загрузка данных] =====");
      console.log("URL:", url);

      try {
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const rawText = await res.text();
        let responseJson;
        try {
          responseJson = JSON.parse(rawText);
        } catch (e) {
          throw new Error("Ошибка парсинга JSON (useEffect): " + e.message);
        }

        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}: ${JSON.stringify(responseJson)}`);
        }

        const dataArray = responseJson.data || [];
        const meta = responseJson.meta || {};
        const total = meta.total || dataArray.length;
        setTableData(dataArray);
        setTotalItems(total);
      } catch (error) {
        console.error("[useEffect] Ошибка загрузки данных:", error);
      }
    };

    loadData();
  }, [setTableData, token, currentPage, setTotalItems]);

  return (
    <>
      <header className="flex justify-between items-center bg-[#F9F9F9] px-6 py-3 mx-6 rounded-3xl">
        <Logo />
        <div className="flex items-center space-x-10">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Kadastr raqamini kiriting"
          />
          <FilterButton onClick={() => setIsFilterOpen(true)} />
          <LogoutButton />
        </div>
      </header>
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleFilterApply}
      />
    </>
  );
};

export default HeaderUser;
