import { useState, useEffect } from "react";
import { MoreHorizontal, Eye, Pencil, Trash } from "lucide-react";
import ViewModal from "./ViewModal";
import EditModal from "./EditModal";
import DeleteModal from "./DeleteModal";

const ActionDropdown = ({ item }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-menu")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleOpenModal = (type) => {
    setModalType(type);
    setOpenDropdown(null);
  };

  const handleCloseModal = () => {
    setModalType(null);
  };

  return (
    <div className="py-6 px-4 bg-white rounded-r-3xl relative">
      {/* Кнопка ... */}
      <button
        className="text-black"
        onClick={(e) => {
          e.stopPropagation();
          setOpenDropdown(openDropdown === item.id ? null : item.id);
        }}
      >
        <MoreHorizontal />
      </button>

      {/* Выпадающее меню */}
      {openDropdown === item.id && (
        <div className="absolute right-0 mt-1 z-50 w-52 bg-white rounded-lg border border-[#e9e9eb] p-2 dropdown-menu">
          <button
            onClick={() => handleOpenModal("view")}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 cursor-pointer hover:text-blue-500 w-full text-left"
          >
            <Eye className="w-5 h-5" /> Ko‘rish
          </button>
          <button
            onClick={() => handleOpenModal("edit")}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 cursor-pointer hover:text-blue-500 w-full text-left"
          >
            <Pencil className="w-5 h-5" /> O‘zgartirish
          </button>
          <button
            onClick={() => handleOpenModal("delete")}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 cursor-pointer hover:text-red-500 w-full text-left"
          >
            <Trash className="w-5 h-5" /> O‘chirish
          </button>
        </div>
      )}

      {/* Модалки */}
      {modalType === "view" && <ViewModal item={item} onClose={handleCloseModal} />}
      {modalType === "edit" && <EditModal item={item} onClose={handleCloseModal} />}
      {modalType === "delete" && <DeleteModal item={item} onClose={handleCloseModal} />}
    </div>
  );
};

export default ActionDropdown;
