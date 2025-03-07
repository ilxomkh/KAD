import { useState } from "react";
import { Search } from "lucide-react";

const SearchBar = ({ placeholder = "Kadastr raqamini kiriting", onSearch }) => {
  const [searchValue, setSearchValue] = useState("");

  const handleInputChange = (e) => {
    setSearchValue(e.target.value);
  };

  // При нажатии Enter вызываем onSearch и очищаем поле
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(searchValue.trim());
      setSearchValue(""); // Сброс поля, чтобы placeholder появился
    }
  };

  return (
    <div className="relative flex items-center">
      <Search className="absolute left-3 text-gray-400" size={18} />
      <input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="pl-10 pr-4 py-3 bg-gray-100 rounded-full outline-none w-80"
      />
    </div>
  );
};

export default SearchBar;
