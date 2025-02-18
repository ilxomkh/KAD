import { X } from "lucide-react";

const Modal = ({ title, children, onClose, width = "w-96", height = "h-auto"}) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div className={`bg-white p-6 rounded-xl shadow-lg relative ${width} ${height}`}>
      <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
        <X size={24} />
      </button>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  </div>
);

export default Modal;
