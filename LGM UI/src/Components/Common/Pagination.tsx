import React from "react";

interface PaginationProps {
  totalItems: number;
  rowsPerPage: number;
  setRowsPerPage: (value: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  rowsPerPage,
  setRowsPerPage,
  currentPage,
  setCurrentPage,
}) => {
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); 
  };

  const startEntry = totalItems > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0;
  const endEntry = Math.min(currentPage * rowsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between mt-4 px-2 py-2 text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <span>Rows per page:</span>
        <select
          value={rowsPerPage}
          onChange={handleRowsPerPageChange}
          className="border border-gray-300 rounded-md p-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      <div>
        Showing {startEntry}-{endEntry} of {totalItems}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages > 0 ? totalPages : 1}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages || totalItems === 0}
          className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
