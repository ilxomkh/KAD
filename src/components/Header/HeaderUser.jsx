import React, { useState, useEffect } from "react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import FilterButton from "./FilterButton";
import LogoutButton from "./LogoutButton";
import FilterModal from "../FilterModal";
import { BASE_URL } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const HeaderUser = ({ setTableData }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { token } = useAuth();

  // Функция поиска для кадастра
  const handleSearch = async (query) => {
    const encodedQuery = encodeURIComponent(query.trim());
    const url = `${BASE_URL}/api/cadastre`;

    console.log("===== [handleSearch] =====");
    console.log("BASE_URL:", BASE_URL);
    console.log("token:", token);
    console.log("Поисковый запрос:", query);
    console.log("Полный URL:", url);

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("[handleSearch] HTTP статус:", res.status);
      console.log("[handleSearch] Response headers:", [...res.headers.entries()]);

      const rawText = await res.text();
      console.log("[handleSearch] Raw response body:", rawText);

      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        throw new Error("Ошибка парсинга JSON (handleSearch): " + e.message);
      }

      console.log("[handleSearch] Распарсенный data:", data);

      if (!res.ok) {
        // Если статус не ок, выбрасываем ошибку с телом ответа
        throw new Error(`HTTP error ${res.status}: ${JSON.stringify(data)}`);
      }

      // Если API вернёт { data: [...] }, извлекаем массив
      const dataArray = Array.isArray(data) ? data : data.data || [];
      console.log("[handleSearch] Преобразованный массив данных:", dataArray);

      // Фильтрация по введённому запросу
      const searchLower = query.trim().toLowerCase();
      const filteredData = dataArray.filter((item) =>
        item.cadastreId.toLowerCase().includes(searchLower)
      );
      console.log("[handleSearch] Отфильтрованные данные:", filteredData);

      setTableData(filteredData);
    } catch (error) {
      console.error("[handleSearch] Ошибка поиска кадастра:", error);
      setTableData([]);
    }
  };

  // Обработчик фильтров (клиентская фильтрация)
  const handleFilterApply = async (filters) => {
    const url = `${BASE_URL}/api/cadastre`;

    console.log("===== [handleFilterApply] =====");
    console.log("BASE_URL:", BASE_URL);
    console.log("token:", token);
    console.log("Применяем фильтры:", filters);
    console.log("Полный URL:", url);

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("[handleFilterApply] HTTP статус:", res.status);
      console.log("[handleFilterApply] Response headers:", [...res.headers.entries()]);

      const rawText = await res.text();
      console.log("[handleFilterApply] Raw response body:", rawText);

      let allData;
      try {
        allData = JSON.parse(rawText);
      } catch (e) {
        throw new Error("Ошибка парсинга JSON (handleFilterApply): " + e.message);
      }

      console.log("[handleFilterApply] Распарсенный data:", allData);

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${JSON.stringify(allData)}`);
      }

      // Преобразуем ответ к массиву
      const dataArray = Array.isArray(allData)
        ? allData
        : Array.isArray(allData.data)
        ? allData.data
        : [];
      console.log("[handleFilterApply] Преобразованный массив всех данных:", dataArray);

      // Фильтрация на клиенте
      const filteredData = dataArray.filter((item) => {
        const matchModda =
          !filters.modda ||
          item.modda?.toString() === filters.modda.replace("-modda", "");
        const matchRegion =
          !filters.region || item.region === filters.region;
        const matchDeadline =
          !filters.deadline ||
          new Date(item.assignDate).getDate() === Number(filters.deadline);
        const matchType = !filters.type || item.type === filters.type;

        return matchModda && matchRegion && matchDeadline && matchType;
      });

      console.log("[handleFilterApply] Отфильтрованные данные:", filteredData);
      setTableData(filteredData);
    } catch (error) {
      console.error("[handleFilterApply] Ошибка получения/фильтрации данных:", error);
    }
  };

  // Эффект для первоначальной загрузки всех данных
  useEffect(() => {
    const loadData = async () => {
      const url = `${BASE_URL}/api/cadastre`;

      console.log("===== [useEffect - начальная загрузка] =====");
      console.log("BASE_URL:", BASE_URL);
      console.log("token:", token);
      console.log("Полный URL:", url);

      try {
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("[useEffect] HTTP статус:", res.status);
        console.log("[useEffect] Response headers:", [...res.headers.entries()]);

        const rawText = await res.text();
        console.log("[useEffect] Raw response body:", rawText);

        let data;
        try {
          data = JSON.parse(rawText);
        } catch (e) {
          throw new Error("Ошибка парсинга JSON (useEffect): " + e.message);
        }

        console.log("[useEffect] Распарсенный data:", data);

        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}: ${JSON.stringify(data)}`);
        }

        // Если API возвращает объект с data, используем его
        const dataArray = data && data.data ? data.data : [];
        console.log("[useEffect] Преобразованный массив данных:", dataArray);

        setTableData(dataArray);
      } catch (error) {
        console.error("[useEffect] Ошибка загрузки данных:", error);
      }
    };

    loadData();
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
