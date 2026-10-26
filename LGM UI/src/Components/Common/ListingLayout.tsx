import React, { useEffect, useMemo, useState } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import { listingTableStyles } from "./listingTableStyles";
import { buttonStyles } from "./buttonStyles";
import {
  FaChevronLeft,
  FaChevronRight,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";
import LogoLoader from "./LogoLoader";

interface ListingLayoutProps<T> {
  title: string;
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  filterText: string;
  onFilterChange: (value: string) => void;
  onCreate?: () => void;
  createLabel?: string;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  onTableScroll?: () => void;
  showLeftArrow?: boolean;
  showRightArrow?: boolean;
  onScrollClick?: (direction: "left" | "right") => void;
  createButtonText?: string; 
}

function ListingLayout<T>({
  title,
  columns,
  data,
  isLoading,
  filterText,
  onFilterChange,
  onCreate,
  createLabel = "+ Create New",
  scrollContainerRef,
  onTableScroll,
  showLeftArrow,
  showRightArrow,
  onScrollClick,
// createButtonText = "Create New", 

}: ListingLayoutProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, filterText]);

  const totalRows = data.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startRow = totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endRow = Math.min(currentPage * rowsPerPage, totalRows);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return data.slice(startIndex, startIndex + rowsPerPage);
  }, [data, currentPage, rowsPerPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-normal text-gray-900 border-b-2 border-[#143463] pb-1">
          {title}
        </h2>

        {onCreate && (
          <button onClick={onCreate} className={buttonStyles.create}>
            {createLabel}
          </button>
        )}
      </div>

      <div className="flex justify-end mb-4">
        <div className="flex items-center">
          <label className="text-gray-600 mr-2">Search:</label>
          <input
            type="text"
            value={filterText}
            onChange={(e) => onFilterChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-72 bg-white"
          />
        </div>
      </div>

      <div className="relative">
        {showLeftArrow && (
          <button
            type="button"
            onClick={() => onScrollClick?.("left")}
            className="absolute left-2 top-[42%] -translate-y-1/2 z-50 bg-[#f07837] hover:bg-[#194485] text-white border border-gray-300 shadow-md rounded-full p-2"
            aria-label="Scroll left"
          >
            <FaChevronLeft size={16} />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          onScroll={onTableScroll}
          className="overflow-x-auto overflow-y-hidden border border-gray-200 rounded-t-lg border-b-0"
        >
          <div className="w-max min-w-full">
            <DataTable
              columns={columns}
              data={paginatedData} 
              striped
              highlightOnHover
              progressPending={isLoading}
              progressComponent={<LogoLoader />}
              customStyles={listingTableStyles}
              persistTableHead
              responsive={false}
            />
          </div>
        </div>

        {showRightArrow && (
          <button
            type="button"
            onClick={() => onScrollClick?.("right")}
            className="absolute right-4 top-[42%] -translate-y-1/2 z-30 bg-[#f07837] hover:bg-[#0d3357] text-white backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-300 transition-all"
            aria-label="Scroll right"
          >
            <FaChevronRight size={18} />
          </button>
        )}

        <div className="border-x border-b border-gray-200 rounded-b-lg bg-white px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 bg-white outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="min-w-[110px] text-center">
              {startRow}-{endRow} of {totalRows}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 disabled:opacity-40 hover:text-gray-700"
                aria-label="First page"
              >
                <FaAngleDoubleLeft size={14} />
              </button>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 disabled:opacity-40 hover:text-gray-700"
                aria-label="Previous page"
              >
                <FaAngleLeft size={14} />
              </button>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 disabled:opacity-40 hover:text-gray-700"
                aria-label="Next page"
              >
                <FaAngleRight size={14} />
              </button>

              <button
                type="button"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 disabled:opacity-40 hover:text-gray-700"
                aria-label="Last page"
              >
                <FaAngleDoubleRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListingLayout;