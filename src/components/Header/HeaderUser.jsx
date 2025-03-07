import React, { useState, useEffect } from "react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import FilterButton from "./FilterButton";
import LogoutButton from "./LogoutButton";
import FilterModal from "../FilterModal";
import { BASE_URL } from "../../utils/api";

// Токен авторизации (его можно хранить в localStorage или получать динамически)
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJ1c2VybmFtZSI6InJvb3QiLCJyb2xlIjoiYWRtaW4ifSwiZXhwIjoxNzQxMzQyNjAxLCJpYXQiOjE3NDEzMzkwMDF9.tYra8W6Bl3Gq08GcQiI_CJT7a3URzVUKW_gsI-7fFhI";

const HeaderUser = ({ setTableData }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    window.location.reload();
  };

  // Функция поиска для кадастра
  const handleSearch = (query) => {
    // Кодируем запрос, если нужно (вдруг пользователь вводит спецсимволы)
    const encodedQuery = encodeURIComponent(query.trim());
    const url = `${BASE_URL}/api/cadastre`; // Тот же endpoint, что и у фильтра
    console.log("Запрос по URL:", url);
  
    fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          // Если сервер вернул ошибку (4xx/5xx), очищаем таблицу и бросаем ошибку
          setTableData([]);
          return res.text().then((text) => {
            throw new Error(`HTTP error ${res.status}: ${text}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log("Search results for cadastre:", data);
        // Извлекаем массив из ответа
        const dataArray = Array.isArray(data) ? data : data.data || [];
  
        // Выполняем клиентский поиск по полю cadastreId (или любому другому)
        // Здесь — пример точного совпадения:
        // const filteredData = dataArray.filter((item) => item.cadastreId === query.trim());
  
        // Или частичное совпадение (регистр игнорируется):
        const searchLower = query.trim().toLowerCase();
        const filteredData = dataArray.filter((item) =>
          item.cadastreId.toLowerCase().includes(searchLower)
        );
  
        // Обновляем таблицу отфильтрованными данными
        setTableData(filteredData);
      })
      .catch((error) => {
        console.error("Error searching cadastre:", error);
        // Если возникла ошибка, оставляем таблицу пустой
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
  }, [setTableData]);

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
          <LogoutButton onLogout={handleLogout} />
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
