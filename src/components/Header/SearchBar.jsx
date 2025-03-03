// SearchBar.jsx
import { useState } from "react";
import { Search } from "lucide-react"; // Иконка поиска

const SearchBar = ({ placeholder = "Kadastr raqamini kiriting" }) => {
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  return (
    <div className="relative flex items-center">
      <Search className="absolute left-3 text-gray-400" size={18} />
      <input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={handleSearch}
        className="pl-10 pr-4 py-3 bg-gray-100 rounded-full outline-none w-80"
      />
    </div>
  );
};

export default SearchBar;
