import { XCircle } from "lucide-react";

const BASE_URL = "https://virtserver.swaggerhub.com/KABRA0413/super-etirof/1.0.0";

const DeleteModal = ({ item, onClose, onDelete }) => {
  const handleDelete = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/${item.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Ошибка при удалении пользователя");
      }
      console.log("Пользователь удален:", item);
      // Вызываем onDelete, передавая, например, id удаленного пользователя
      if (onDelete) onDelete(item.id);
      onClose();
    } catch (error) {
      console.error("Ошибка сети:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-50 z-50"
      onClick={onClose}
    >
      <div className="bg-white p-3 rounded-2xl shadow-lg w-[444px] relative">
        {/* Заголовок */}
        <h2 className="text-xl font-semibold text-left text-black mb-4">
          Bu foydalanuvchini o‘chirmoqchimisiz?
        </h2>

        {/* Кнопки */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleDelete}
            className="px-10 py-3 bg-[#e63956] w-full text-white rounded-xl text-lg font-semibold hover:bg-red-500 transition"
          >
            Ha
          </button>
          <button
            onClick={onClose}
            className="px-10 py-3 bg-[#f7f9fb] w-full border border-[#e9e9eb] text-black rounded-xl text-lg font-semibold hover:bg-gray-100 transition"
          >
            Yoq
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
