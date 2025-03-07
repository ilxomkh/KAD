// components/LogoutButton.jsx

import { useAuth } from "../../context/AuthContext";

const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <div className="group">
      <button
        className="flex items-center cursor-pointer text-gray-600 transition group-hover:text-blue-500"
        onClick={logout}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition group-hover:text-blue-500"
        >
          <path
            d="M12 12H21M21 12L18.5 9.5M21 12L18.5 14.5M15 8.5V8.4C15 6.15016 15 5.02524 14.4271 4.23664C14.242 3.98196 14.018 3.75799 13.7634 3.57295C12.9748 3 11.8498 3 9.6 3H8.4C6.15016 3 5.02524 3 4.23664 3.57295C3.98196 3.75799 3.75799 3.98196 3.57295 4.23664C3 5.02524 3 6.15016 3 8.4V15.6C3 17.8498 3 18.9748 3.57295 19.7634C3.75799 20.018 3.98196 20.242 4.23664 20.4271C5.02524 21 6.15016 21 8.4 21H9.6C11.8498 21 12.9748 21 13.7634 20.4271C14.018 20.242 14.242 20.018 14.4271 19.7634C15 18.9748 15 17.8498 15 15.6V15.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-lg font-semibold ml-1 transition group-hover:text-blue-500">
          Chiqish
        </span>
      </button>
    </div>
  );
};

export default LogoutButton;
