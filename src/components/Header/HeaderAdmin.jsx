import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import SearchBar from "./SearchBar";
import FilterButton from "./FilterButton";
import LogoutButton from "./LogoutButton";
import AddUsers from "../AddUsers";
import FilterModal from "../FilterModal";
import { BASE_URL } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const HeaderAdmin = ({ 
  currentTable, 
  setCurrentTable, 
  setTableData, 
  currentPage, 
  setCurrentPage 
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const menuOptions = [
    { key: "default", label: "Nomzodlar ro‘yxati" },
    { key: "role1", label: "1-bosqichdagilar" },
    { key: "role4", label: "1-bosqichdagilar (7-9)" },
    { key: "role2", label: "2-bosqichdagilar" },
    { key: "role3", label: "3-bosqichdagilar" },
    { key: "sended", label: "Imzolanganlar" },
    { key: "ended", label: "Tugallanganlar" },
    { key: "errors", label: "Kadastr xatoliklari" },
    { key: "moderation", label: "Moderatsiya" },
  ];

  const selectedOption =
    menuOptions.find((option) => option.key === currentTable) ||
    menuOptions[0];

  const handleSelectTable = (table) => {
    console.log("Выбрана таблица:", table);
    setCurrentTable(table);
    setDropdownOpen(false);
    // При смене таблицы сбрасываем номер страницы
    setCurrentPage(1);
  };

  const { token } = useAuth();

  // Функция поиска для пользователей и кадастров
  const handleSearch = (query) => {
    const encodedQuery = encodeURIComponent(query.trim());
    let url = "";
    if (currentTable === "users") {
      url = `${BASE_URL}/api/users?page=${currentPage}`;
    } else {
      url = `${BASE_URL}/api/cadastre?page=${currentPage}&search=${encodedQuery}`;
    }
    console.log("Запрос по URL:", url);

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
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
        console.log(
          currentTable === "users"
            ? "Search results for users:"
            : "Search results for cadastre:",
          data
        );
        const dataArray =
          currentTable === "users"
            ? (Array.isArray(data) ? data : data.users || data.data || [])
            : (Array.isArray(data) ? data : data.data || []);

        if (currentTable === "users") {
          const searchLower = query.trim().toLowerCase();
          const filteredData = dataArray.filter((item) =>
            (item.username &&
              item.username.toLowerCase().includes(searchLower)) ||
            (item.firstName &&
              item.firstName.toLowerCase().includes(searchLower)) ||
            (item.lastName &&
              item.lastName.toLowerCase().includes(searchLower)) ||
            (item.middleName &&
              item.middleName.toLowerCase().includes(searchLower)) ||
            (item.ID && item.ID.toString().toLowerCase().includes(searchLower)) ||
            (item.role && item.role.toLowerCase().includes(searchLower))
          );
          setTableData(filteredData);
        } else {
          const queryLower = query.trim().toLowerCase();
          const filteredData = dataArray.filter((item) =>
            item.cadastreId.toLowerCase().includes(queryLower)
          );
          setTableData(filteredData);
        }
      })
      .catch((error) => {
        console.error("Error searching cadastre/users:", error);
        setTableData([]);
      });
  };

  // Обработчик фильтров (клиентская фильтрация)
  const handleFilterApply = (filters) => {
    // Проверяем, заданы ли какие-либо фильтры
    const hasFilter = Object.values(filters).some((value) => value !== "" && value !== null);
    
    // Если фильтры заданы, запрашиваем все данные, иначе – используем пагинацию
    const url = hasFilter 
      ? `${BASE_URL}/api/cadastre`
      : `${BASE_URL}/api/cadastre?page=1`;
  
    console.log("Применяем фильтры в HeaderAdmin:", filters);
    console.log("Запрос на получение данных по URL:", url);
  
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
        if (currentTable === "users") {
          const searchLower = filters.query ? filters.query.trim().toLowerCase() : "";
          const filteredData = dataArray.filter((item) => {
            const usernameMatch =
              !searchLower ||
              (item.username && item.username.toLowerCase().includes(searchLower));
            const firstNameMatch =
              !searchLower ||
              (item.firstName && item.firstName.toLowerCase().includes(searchLower));
            return usernameMatch || firstNameMatch;
          });
          console.log("Отфильтрованные пользователи:", filteredData);
          setTableData(filteredData);
        } else {
          const filteredData = dataArray.filter((item) => {
            const matchModda =
              !filters.modda ||
              item.modda.toString() === filters.modda.replace("-modda", "");
            const matchRegion =
              !filters.region || item.region === filters.region;
            const matchStatus =
              !filters.status || item.status === filters.status;
            const matchDeadline =
              !filters.deadline ||
              new Date(item.assignDate).getDate() === Number(filters.deadline);
            const matchType =
              !filters.type || item.type === filters.type;
            const matchKadastr =
              !filters.kadastr || item.kadastr === filters.kadastr;
            const matchBuildingPresence =
              !filters.buildingPresence || item.buildingPresence === filters.buildingPresence;
            return (
              matchModda &&
              matchRegion &&
              matchDeadline &&
              matchType &&
              matchStatus &&
              matchKadastr &&
              matchBuildingPresence
            );
          });
          console.log("Отфильтрованные данные для кадастра:", filteredData);
          setTableData(filteredData);
        }
      })
      .catch((error) => console.error("Error fetching or filtering data:", error));
  };
  
  

  // Первоначальная загрузка данных с учетом пагинации
  useEffect(() => {
    let url = "";
    if (currentTable === "users") {
      url = `${BASE_URL}/api/users?page=${currentPage}`;
    } else {
      url = `${BASE_URL}/api/cadastre?page=${currentPage}`;
    }
    console.log("Начальная загрузка данных по URL:", url);
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const dataArray = Array.isArray(data)
          ? data
          : data.data || [];
        setTableData(dataArray);
      })
      .catch((error) => console.error("Error loading data:", error));
  }, [setTableData, token, currentPage, currentTable]);

  return (
    <>
      {dropdownOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20"
          onClick={() => setDropdownOpen(false)}
        />
      )}
      <header className="flex justify-between items-center bg-[#F9F9F9] px-6 py-3 mx-6 rounded-3xl relative z-20">
        <div className="flex items-center space-x-12">
          <img src="/assets/Blue.svg" alt="ZBEKOSMOS" className="h-12 w-auto" />
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex cursor-pointer items-center text-lg font-semibold px-4 py-3 transition rounded-full ${
                currentTable === "users"
                  ? "text-gray-700 hover:text-blue-500 transition-colors duration-300"
                  : "bg-blue-500 text-white"
              }`}
            >
              {selectedOption.label}
              <ChevronDown className="ml-2 mt-1 w-5 h-5" />
            </button>
            {dropdownOpen && (
              <div className="absolute -left-6 mt-4 w-60 bg-white rounded-3xl p-2 z-10">
                {menuOptions.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => handleSelectTable(option.key)}
                    className={`block dark:text-gray-900 cursor-pointer px-4 py-2 w-full text-left text-lg ${
                      currentTable === option.key
                        ? "bg-white"
                        : "transition-colors duration-500 hover:text-blue-500"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => handleSelectTable("users")}
            className={`text-gray-700 cursor-pointer text-lg font-semibold ${
              currentTable === "users"
                ? "bg-blue-500 text-white px-4 py-3 rounded-full"
                : "hover:text-blue-500 transition-colors duration-300"
            }`}
          >
            Foydalanuvchilar
          </button>
        </div>
        <div className="flex items-center space-x-8 mr-4">
          <SearchBar
            onSearch={handleSearch}
            placeholder={
              currentTable === "users"
                ? "Foydalanuvchini qidirish"
                : "Kadastr raqamini kiriting"
            }
          />
          <FilterButton onClick={() => setIsFilterOpen(true)} />
          {currentTable === "users" && (
            <button
              className="flex cursor-pointer items-center bg-blue-500 text-white px-4 py-3 rounded-xl hover:bg-blue-600 transition"
              onClick={() => setIsModalOpen(true)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 22.6667V12M12 12V1.33337M12 12H22.6667M12 12H1.33337"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-lg font-semibold ml-2">Qo‘shish</span>
            </button>
          )}
          <LogoutButton />
        </div>
      </header>
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleFilterApply}
      />
      {isModalOpen && <AddUsers onClose={() => setIsModalOpen(false)} />}
    </>
  );
};

export default HeaderAdmin;
