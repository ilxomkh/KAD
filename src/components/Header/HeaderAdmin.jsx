import React, { useState, useEffect } from "react";
import axios from "axios"; // 👈 обязательно
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
  setCurrentPage,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { token, refreshTokenRequest, logout } = useAuth(); // 👈 достаём всё сразу

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
    menuOptions.find((option) => option.key === currentTable) || menuOptions[0];

  const handleSelectTable = (table) => {
    console.log("Выбрана таблица:", table);
    setCurrentTable(table);
    setDropdownOpen(false);
    setCurrentPage(1);
  };

  const fetchAllCadastreData = async () => {
    let allData = [];
    let page = 1;
    let totalPages = 1;

    try {
      while (page <= totalPages) {
        try {
          const res = await axios.get(`${BASE_URL}/api/cadastre?page=${page}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = res.data;
          const pageData = Array.isArray(data.data) ? data.data : [];
          allData = [...allData, ...pageData];
          totalPages = data.meta?.totalPages || 1;
          page++;
        } catch (error) {
          if (error.response && error.response.status === 401) {
            console.warn("401 при загрузке кадастра — обновляем токен...");
            await refreshTokenRequest();
            return await fetchAllCadastreData(); // 🔁 повтор
          } else {
            throw error;
          }
        }
      }
    } catch (err) {
      console.error("Ошибка при загрузке кадастра:", err);
    }

    return allData;
  };

  const fetchAllUsersData = async () => {
    let allData = [];
    let page = 1;
    let totalPages = 1;

    try {
      while (page <= totalPages) {
        try {
          const res = await axios.get(`${BASE_URL}/api/users?page=${page}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = res.data;
          const pageData = Array.isArray(data.users) ? data.users : [];
          allData = [...allData, ...pageData];
          totalPages = data.meta?.totalPages || 1;
          page++;
        } catch (error) {
          if (error.response && error.response.status === 401) {
            console.warn("401 при загрузке пользователей — обновляем токен...");
            await refreshTokenRequest();
            return await fetchAllUsersData(); // 🔁 повтор
          } else {
            throw error;
          }
        }
      }
    } catch (err) {
      console.error("Ошибка при загрузке пользователей:", err);
    }

    return allData;
  };

  const handleSearch = async (query) => {
    const searchLower = query.trim().toLowerCase();
    if (currentTable === "users") {
      const allUsers = await fetchAllUsersData();
      const filteredData = allUsers.filter(
        (item) =>
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
      const allCadastre = await fetchAllCadastreData();
      const filteredData = allCadastre.filter(
        (item) =>
          item.cadastreId && item.cadastreId.toLowerCase().includes(searchLower)
      );
      setTableData(filteredData);
    }
  };

  const handleFilterApply = async (filters) => {
    console.log("Применяем фильтры:", filters);

    if (currentTable === "users") {
      const allUsers = await fetchAllUsersData();
      const searchLower = filters.query
        ? filters.query.trim().toLowerCase()
        : "";

      const filteredData = allUsers.filter((item) => {
        const usernameMatch =
          !searchLower ||
          (item.username && item.username.toLowerCase().includes(searchLower));
        const firstNameMatch =
          !searchLower ||
          (item.firstName &&
            item.firstName.toLowerCase().includes(searchLower));
        return usernameMatch || firstNameMatch;
      });

      console.log("Отфильтрованные пользователи:", filteredData);
      setTableData(filteredData);
    } else {
      const allCadastre = await fetchAllCadastreData();
      const filteredData = allCadastre.filter((item) => {
        const matchModda =
          !filters.modda ||
          item.modda?.toString() === filters.modda.replace("-modda", "");
        const matchRegion = !filters.region || item.region === filters.region;
        const matchStatus = !filters.status || item.status === filters.status;
        const matchDeadline =
          !filters.deadline ||
          new Date(item.assignDate).getDate() === Number(filters.deadline);
        const matchType = !filters.type || item.type === filters.type;
        const matchKadastr =
          !filters.kadastr || item.kadastr === filters.kadastr;
        const matchBuildingPresence =
          !filters.buildingPresence ||
          item.buildingPresence === filters.buildingPresence;

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

      console.log("Отфильтрованные кадастры:", filteredData);
      setTableData(filteredData);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        let url = "";
        if (currentTable === "users") {
          url = `${BASE_URL}/api/users?page=${currentPage}`;
        } else {
          url = `${BASE_URL}/api/cadastre?page=${currentPage}`;
        }

        console.log("Загрузка данных:", url);

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        const dataArray = Array.isArray(data) ? data : data.data || [];
        setTableData(dataArray);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.warn("401 при загрузке — обновляем токен...");
          try {
            await refreshTokenRequest();
            fetchInitialData(); // 🔁 повтор
          } catch (refreshError) {
            console.error("Не удалось обновить токен:", refreshError);
            logout();
          }
        } else {
          console.error("Ошибка загрузки данных:", error);
        }
      }
    };

    fetchInitialData();
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
        {/* Левый блок */}
        <div className="flex items-center space-x-6">
          <img src="/assets/Blue.svg" alt="ZBEKOSMOS" className="h-12 w-auto" />

          <div className="relative">
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className={`flex items-center px-4 py-3 rounded-full transition ${
                currentTable !== "users" && currentTable !== "statistics"
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:text-blue-500"
              }`}
            >
              {selectedOption.label}
              <ChevronDown className="ml-2 w-5 h-5" />
            </button>
            {dropdownOpen && (
              <div className="absolute mt-2 w-60 bg-white rounded-3xl p-2 shadow z-10">
                {menuOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => handleSelectTable(opt.key)}
                    className={`block w-full text-left px-4 py-2 text-lg transition ${
                      currentTable === opt.key
                        ? "bg-blue-100 text-blue-600"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => handleSelectTable("users")}
            className={`px-4 py-3 rounded-full font-semibold transition ${
              currentTable === "users"
                ? "bg-blue-500 text-white"
                : "text-gray-700 hover:text-blue-500"
            }`}
          >
            Foydalanuvchilar
          </button>

          <button
            onClick={() => handleSelectTable("statistics")}
            className={`px-4 py-3 rounded-full font-semibold transition ml-4 ${
              currentTable === "statistics"
                ? "bg-blue-500 text-white"
                : "text-gray-700 hover:text-blue-500"
            }`}
          >
            Statistika
          </button>
        </div>

        {/* Правый блок */}
        <div className="flex items-center space-x-4">
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
              className="flex items-center bg-blue-500 text-white px-4 py-3 rounded-xl hover:bg-blue-600 transition"
              onClick={() => setIsModalOpen(true)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 22.6667V12M12 12V1.33337M12 12H22.6667M12 12H1.33337"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="ml-2 font-semibold">Qo‘shish</span>
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
