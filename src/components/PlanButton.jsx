import React from "react";
import { BASE_URL } from "../utils/api";

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJ1c2VybmFtZSI6InJvb3QiLCJyb2xlIjoiYWRtaW4ifSwiZXhwIjoxNzQxMjY2OTg4LCJpYXQiOjE3NDEyNjMzODh9.Vz4vUbpxqC37y41e3xArINEhWU9Inx7c92uzX7dnQ0A";

const PlanButton = ({ item }) => {
  // Проверяем наличие объекта и item.ID
  if (!item || !item.ID) return null;

  const downloadPlan = async (e) => {
    e.stopPropagation();
    try {
      // Формируем URL с использованием item.ID
      const response = await fetch(
        `${BASE_URL}/api/cadastre/${item.ID}/land_plan`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Ошибка при загрузке плана");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Используем имя файла, пришедшее в данных, или стандартное имя
      link.download = item.landPlan || "land_plan.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Ошибка загрузки плана:", error);
    }
  };

  return (
    <button
      className="flex items-center gap-2 my-button cursor-pointer transition-colors duration-300"
      onClick={downloadPlan}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_plan)">
          <path
            d="M4.02859 3.2C4.02859 1.76406 5.19265 0.6 6.62859 0.6H15.2031L23.4 7.77226V20.8C23.4 22.2359 22.236 23.4 20.8 23.4H6.62859C5.19265 23.4 4.02859 22.2359 4.02859 20.8V3.2Z"
            fill="white"
            stroke="#E4EBF3"
            strokeWidth="1.2"
            className="hover-blue"
          />
          <path
            d="M15.0857 0.599976V5.39998C15.0857 6.72546 16.1602 7.79998 17.4857 7.79998H23.3143"
            stroke="#E4EBF3"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="hover-blue"
          />
        </g>
        <rect y="11.1" width="17.1429" height="9.9" rx="1.6" fill="#E63946" />
        <path
          d="M2.34326 18.2318V13.8682H4.31079C4.68904 13.8682 5.01128 13.9314 5.27752 14.0578C5.54375 14.1828 5.74667 14.3568 5.88628 14.5798C6.02751 14.8014 6.09813 15.0571 6.09813 15.3469C6.09813 15.6366 6.0267 15.8923 5.88385 16.1139C5.74099 16.3355 5.53401 16.5081 5.2629 16.6317C4.99342 16.7552 4.66713 16.817 4.28401 16.817H3.02995V16.0777H4.11355C4.31648 16.0777 4.48368 16.0471 4.61518 15.9861C4.74829 15.9236 4.84732 15.8376 4.91226 15.7282C4.97881 15.6175 5.01209 15.4903 5.01209 15.3469C5.01209 15.202 4.97881 15.0756 4.91226 14.9676C4.84732 14.8582 4.74829 14.7737 4.61518 14.714C4.48206 14.653 4.31323 14.6224 4.10868 14.6224H3.39764V18.2318H2.34326Z"
          fill="white"
        />
        <path
          d="M8.41371 18.2318H6.64585V13.8682H8.42832C8.92994 13.8682 9.36176 13.9555 9.72377 14.1302C10.0858 14.3035 10.3642 14.5528 10.559 14.8781C10.7554 15.2034 10.8536 15.5926 10.8536 16.0457C10.8536 16.5003 10.7554 16.8909 10.559 17.2176C10.3642 17.5443 10.0842 17.795 9.7189 17.9697C9.35527 18.1444 8.9202 18.2318 8.41371 18.2318ZM7.70023 17.4413H8.36988C8.68157 17.4413 8.94374 17.393 9.1564 17.2964C9.37069 17.1984 9.5314 17.0471 9.63855 16.8426C9.74731 16.6366 9.8017 16.371 9.8017 16.0457C9.8017 15.7233 9.74731 15.4598 9.63855 15.2552C9.5314 15.0507 9.3715 14.9001 9.15884 14.8035C8.94618 14.7069 8.684 14.6586 8.37231 14.6586H7.70023V17.4413Z"
          fill="white"
        />
        <path
          d="M11.4975 18.2318V13.8682H14.7995V14.6288H12.5519V15.6686H14.5803V16.4292H12.5519V18.2318H11.4975Z"
          fill="white"
        />
        <defs>
          <clipPath id="clip0_plan">
            <rect
              width="20.5714"
              height="24"
              fill="white"
              transform="translate(3.42859)"
            />
          </clipPath>
        </defs>
      </svg>{" "}
      Reja
    </button>
  );
};

export default PlanButton;
