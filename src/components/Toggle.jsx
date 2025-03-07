import React, { useState } from 'react';
import { BASE_URL } from "../utils/api";

const token = 
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJ1c2VybmFtZSI6InJvb3QiLCJyb2xlIjoiYWRtaW4ifSwiZXhwIjoxNzQxMzQyNjAxLCJpYXQiOjE3NDEzMzkwMDF9.tYra8W6Bl3Gq08GcQiI_CJT7a3URzVUKW_gsI-7fFhI";

const ToggleSwitch = ({ userId, initialStatus, onToggle }) => {
  const [status, setStatus] = useState(initialStatus);

  const handleToggle = async () => {
    if (!userId) {
      console.error("Ошибка: userId не определён!");
      return;
    }

    const newStatus = !status;
    try {
      const response = await fetch(`${BASE_URL}/api/users/${userId}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ active: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении статуса пользователя');
      }

      setStatus(newStatus);
      if (onToggle) onToggle(newStatus);
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
