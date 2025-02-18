import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const [visiblePages, setVisiblePages] = useState([]);

    useEffect(() => {
        const generatePages = () => {
            let pages = [];
            if (totalPages <= 5) {
                pages = Array.from({ length: totalPages }, (_, i) => i + 1);
            } else if (currentPage <= 3) {
                pages = [1, 2, 3, "...", totalPages];
            } else if (currentPage >= totalPages - 2) {
                pages = [1, "...", totalPages - 2, totalPages - 1, totalPages];
            } else {
                pages = [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
            }
            setVisiblePages(pages);
        };

        generatePages();
    }, [currentPage, totalPages]);

    if (totalPages <= 1) return null; // Не показывать пагинацию, если всего 1 страница

    return (
        <div className="flex justify-center items-center space-x-2 mt-3 mb-3">
            {/* Кнопка "Назад" */}
            <button
                className={`w-10 h-10 flex items-center justify-center rounded-full transition ${
                    currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <ChevronLeft size={20} />
            </button>

            {/* Отображение страниц */}
            {visiblePages.map((page, index) => (
                <button
                    key={index}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition text-lg font-semibold ${
                        page === currentPage
                            ? "bg-blue-500 text-white"
                            : page === "..."
                            ? "text-gray-500 cursor-default"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => page !== "..." && onPageChange(page)}
                    disabled={page === "..."}
                >
                    {page}
                </button>
            ))}

            {/* Кнопка "Вперед" */}
            <button
                className={`w-10 h-10 flex items-center justify-center rounded-full transition ${
                    currentPage === totalPages
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

export default Pagination;
