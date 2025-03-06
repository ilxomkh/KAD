import React, { useState } from "react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import FilterButton from "./FilterButton";
import LogoutButton from "./LogoutButton";
import FilterModal from "../FilterModal";

const HeaderUser = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    window.location.reload();
  };

  // Функция поиска для кадастра
  const handleSearch = (query) => {
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
        // Здесь обновите состояние или выполните другую логику для отображения данных
      })
      .catch((error) => console.error("Error searching cadastre:", error));
  };

  // Функция для обработки фильтров, выбранных в модальном окне
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
