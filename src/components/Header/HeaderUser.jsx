import React, { useState, useEffect } from "react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import FilterButton from "./FilterButton";
import LogoutButton from "./LogoutButton";
import FilterModal from "../FilterModal";
import { BASE_URL } from "../../utils/api";
import { useAuth } from "../../context/AuthContext"; // Импортируем useAuth

const HeaderUser = ({ setTableData }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Получаем актуальный токен из контекста
  const { token } = useAuth();

  // Функция поиска для кадастра
  const handleSearch = (query) => {
    const encodedQuery = encodeURIComponent(query.trim());
    const url = `${BASE_URL}/api/cadastre`;
    console.log("Запрос по URL:", url);
  
    fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          setTableData([]);
          return res.text().then((text) => {
            throw new Error(`HTTP error ${res.status}: ${text}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log("Search results for cadastre:", data);
        const dataArray = Array.isArray(data) ? data : data.data || [];
        const searchLower = query.trim().toLowerCase();
        const filteredData = dataArray.filter((item) =>
          item.cadastreId.toLowerCase().includes(searchLower)
        );
        setTableData(filteredData);
      })
      .catch((error) => {
        console.error("Error searching cadastre:", error);
        setTableData([]);
      });
  };

  // Обработчик фильтров с клиентской фильтрацией
  const handleFilterApply = (filters) => {
    console.log("Применяем фильтры в HeaderUser:", filters);
    const url = `${BASE_URL}/api/cadastre`;
    console.log("Запрос на получение всех данных по URL:", url);

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((text) => {
            throw new Error(`HTTP error ${res.status}: ${text}`);
          });
        }
        return res.json();
      })
      .then((allData) => {
        const dataArray = Array.isArray(allData)
          ? allData
          : Array.isArray(allData.data)
          ? allData.data
          : [];
        const filteredData = dataArray.filter((item) => {
          const matchModda =
            !filters.modda ||
            item.modda.toString() === filters.modda.replace("-modda", "");
          const matchViloyat =
            !filters.viloyat || item.region === filters.viloyat;
          const matchSanasi =
            !filters.sanasi ||
            new Date(item.assignDate).getDate() === Number(filters.sanasi);
          const matchToifa = !filters.toifa || item.type === filters.toifa;
          return matchModda && matchViloyat && matchSanasi && matchToifa;
        });
        console.log("Отфильтрованные данные:", filteredData);
        setTableData(filteredData);
      })
      .catch((error) =>
        console.error("Error fetching or filtering data:", error)
      );
  };

  // Эффект для первоначальной загрузки всех данных при монтировании
  useEffect(() => {
    const url = `${BASE_URL}/api/cadastre`;
    console.log("Начальная загрузка данных по URL:", url);
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const dataArray = Array.isArray(data) ? data : data.data || [];
        setTableData(dataArray);
      })
      .catch((error) => console.error("Error loading data:", error));
  }, [setTableData, token]);

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
