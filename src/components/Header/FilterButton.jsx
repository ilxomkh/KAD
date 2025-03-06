import React from "react";

const FilterButton = ({ onClick }) => {
  return (
    <div className="group">
      <button
        className="flex items-center cursor-pointer text-gray-600 transition group-hover:text-blue-500"
        onClick={onClick}
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
            d="M3 5.75H5M10.5 5.75L21 5.75M3 18.25H5M10.5 18.25L21 18.25M21 12H19M13.5 12L3 12M16.25 14.75V14.75C14.7312 14.75 13.5 13.5188 13.5 12V12C13.5 10.4812 14.7312 9.25 16.25 9.25V9.25C17.7688 9.25 19 10.4812 19 12V12C19 13.5188 17.7688 14.75 16.25 14.75ZM10.5 18.25V18.25C10.5 16.7312 9.26878 15.5 7.75 15.5V15.5C6.23122 15.5 5 16.7312 5 18.25V18.25C5 19.7688 6.23122 21 7.75 21V21C9.26878 21 10.5 19.7688 10.5 18.25ZM7.75 8.5V8.5C9.26878 8.5 10.5 7.26878 10.5 5.75V5.75C10.5 4.23122 9.26878 3 7.75 3V3C6.23122 3 5 4.23122 5 5.75V5.75C5 7.26878 6.23122 8.5 7.75 8.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-lg ml-1 font-semibold transition group-hover:text-blue-500">
          Filter
        </span>
      </button>
    </div>
  );
};

export default FilterButton;
