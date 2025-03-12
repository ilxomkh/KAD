// CommentModal.jsx
import React from "react";

const CommentModal = ({
  comment,
  setComment,
  activeTab,
  setActiveTab,
  handleSend,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50 pointer-events-auto">
      <div className="bg-white rounded-2xl w-1/4 p-6 text-left relative">
        {/* Заголовок */}
        <h2 className="text-2xl font-semibold mb-6">Izoh qoldiring</h2>

        {/* Табы для выбора типа ошибки */}
        <div className="w-full bg-white border border-[#E9E9EB] mb-6 rounded-xl">
          <div className="flex">
            <button
              onClick={() => setActiveTab("obyekt")}
              className={`flex-1 py-4 cursor-pointer rounded-xl text-center font-medium transition ${
                activeTab === "obyekt"
                  ? "bg-[#e8f3ff] text-blue-500 border border-[#94c6ff]"
                  : "bg-white text-gray-700"
              }`}
            >
              Obyekt joyiga mos emas
            </button>
            <button
              onClick={() => setActiveTab("toifasi")}
              className={`flex-1 py-4 cursor-pointer rounded-xl text-center font-medium transition ${
                activeTab === "toifasi"
                  ? "bg-[#e8f3ff] text-blue-500 border border-[#94c6ff]"
                  : "bg-white text-gray-700"
              }`}
            >
              Toifasi mos emas
            </button>
          </div>
        </div>

        {/* Текстовое поле для ввода комментария */}
        <textarea
          className="w-full border focus:outline-none border-[#E9E9EB] rounded-xl p-4 h-32 placeholder-gray-400 mb-6 resize-none"
          placeholder="Izoh yozing"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {/* Кнопки модального окна */}
        <div className="flex space-x-4">
          <button
            className="flex-1 py-4 cursor-pointer bg-[#1477e8] text-white rounded-xl font-medium transition hover:bg-blue-700"
            onClick={handleSend}
          >
            Yuklash
          </button>
          <button
            className="flex-1 py-4 cursor-pointer bg-[#f7f9fb] border border-[#e9e9eb] text-gray-800 rounded-xl font-medium transition hover:bg-gray-100"
            onClick={onClose}
          >
            Orqaga
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
