import { useState } from "react";
import { ChevronDown } from "lucide-react";
import SearchBar from "./SearchBar";
import FilterButton from "./FilterButton";
import LogoutButton from "./LogoutButton";
import AddUsers from "../AddUsers";
import FilterModal from "../FilterModal";

const HeaderAdmin = ({ currentTable, setCurrentTable }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const menuOptions = [
    { key: "default", label: "Nomzodlar ro‘yxati" },
    { key: "role1", label: "1-bosqichdagilar" },
    { key: "role2", label: "2-bosqichdagilar" },
    { key: "role3", label: "3-bosqichdagilar" },
    { key: "ended", label: "Tugallanganlar" },
    { key: "errors", label: "Kadastr xatoliklari" },
  ];

  const selectedOption =
    menuOptions.find((option) => option.key === currentTable) || menuOptions[0];

  const handleSelectTable = (table) => {
    setCurrentTable(table);
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    window.location.reload();
  };

  // Функция поиска в зависимости от выбранной таблицы
  const handleSearch = (query) => {
    if (currentTable === "users") {
      fetch(`/users/${query}`)
        .then((res) => {
          if (!res.ok) {
            return res.text().then((text) => {
              throw new Error(`HTTP error ${res.status}: ${text}`);
            });
          }
          return res.json();
        })
        .then((data) => {
          console.log("Search results for user:", data);
        })
        .catch((error) => console.error("Error searching user:", error));
    } else {
      fetch(`/cadastres/cad/${query}`)
        .then((res) => {
          if (!res.ok) {
            return res.text().then((text) => {
              throw new Error(`HTTP error ${res.status}: ${text}`);
            });
          }
          return res.json();
        })
        .then((data) => {
          console.log("Search results for cadastre:", data);
        })
        .catch((error) => console.error("Error searching cadastre:", error));
    }
  };

  // Функция для обработки выбранных фильтров из модального окна
  const handleFilterApply = (filters) => {
    if (filters.kadastr) {
      fetch(`/cadastres/cad/${filters.kadastr}`)
        .then((res) => {
          if (!res.ok) {
            return res.text().then((text) => {
              throw new Error(`HTTP error ${res.status}: ${text}`);
            });
          }
          return res.json();
        })
        .then((data) => {
          console.log("Filtered data:", data);
        })
        .catch((error) =>
          console.error("Error fetching filtered data:", error)
        );
    } else {
      console.log("No filter selected", filters);
    }
  };

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
              <div className="absolute -left-3 mt-4 w-56 bg-white rounded-3xl p-2 z-10">
                {menuOptions.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => handleSelectTable(option.key)}
                    className={`block cursor-pointer px-4 py-2 w-full text-left text-lg ${
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

          <LogoutButton onLogout={handleLogout} />
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
