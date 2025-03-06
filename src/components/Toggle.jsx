import React, { useState } from 'react';
import { BASE_URL } from "../utils/api";

// Важно: BASE_URL берём либо из окружения, либо прописываем напрямую

const ToggleSwitch = ({ userId, initialStatus }) => {
  const [status, setStatus] = useState(initialStatus);

  const handleToggle = async () => {
    const newStatus = !status;
    try {
      const response = await fetch(`${BASE_URL}/users/${userId}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        // Если серверу достаточно только "active", то отправляем минимальный JSON
        body: JSON.stringify({ active: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении статуса пользователя');
      }

      // Если запрос успешен — меняем состояние локально
      setStatus(newStatus);
    } catch (error) {
      console.error('Ошибка сети:', error);
    }
  };

  return (
    <div className="flex items-center justify-start gap-3">
      <div
        className={`relative inline-block w-12 h-7 rounded-full cursor-pointer transition-all duration-300 ${
          status ? 'bg-blue-500' : 'bg-gray-300'
        }`}
        onClick={handleToggle}
      >
        <div
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all duration-300 ${
            status ? 'left-6' : 'left-1'
          }`}
        />
      </div>
    </div>
  );
};

export default ToggleSwitch;
