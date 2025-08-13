// src/components/Pagination.js
import React from "react";

const Pagination = ({ currentPage, totalPages, setCurrentPage }) => {
  return (
    <div className="flex items-center gap-2">
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(currentPage - 1)}
        className="px-3 py-1 rounded-full text-gray-600 disabled:opacity-50 hover:bg-gray-100"
      >
        &lt;
      </button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i + 1}
          onClick={() => setCurrentPage(i + 1)}
          className={`px-4 py-1 rounded-full text-sm font-medium transition ${
            currentPage === i + 1
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          {i + 1}
        </button>
      ))}
      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(currentPage + 1)}
        className="px-3 py-1 rounded-full text-gray-600 disabled:opacity-50 hover:bg-gray-100"
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination;
