// src/components/ShowEntries.js
import React from "react";

const ShowEntries = ({ entriesPerPage, setEntriesPerPage, setCurrentPage }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700">Show</span>
      <select
        value={entriesPerPage}
        onChange={(e) => {
          setEntriesPerPage(Number(e.target.value));
          setCurrentPage(1);
        }}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={25}>25</option>
      </select>
      <span className="text-sm text-gray-700">entries</span>
    </div>
  );
};

export default ShowEntries;
