import React, { useState } from 'react';

const ToggleSwitch = ({ userId, initialStatus }) => {
  const [status, setStatus] = useState(initialStatus);

  const handleToggle = async () => {
    const newStatus = !status; // Переключаем статус
    try {
      const response = await fetch(`https://your-backend-api.com/users/${userId}/status`, {
        method: 'POST', // Или PUT, если на бэкенде обновление
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: newStatus }),
      });

      if (response.ok) {
        setStatus(newStatus); // Если запрос успешен, обновляем состояние
      } else {
        console.error('Ошибка при обновлении статуса пользователя');
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    }
  };

  return (
    <div className="flex items-center justify-start gap-3">
      <div
        className={`relative inline-block w-12 h-7 rounded-full cursor-pointer transition-all duration-300 ${status ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        onClick={handleToggle}
      >
        <div
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all duration-300 ${status ? 'left-6' : 'left-1'
            }`}
        />
      </div>
    </div>
  );
};

export default ToggleSwitch;