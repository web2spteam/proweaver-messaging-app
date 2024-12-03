import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface PaginationProps {
  totalPages: number;
  onPageChange: (newPage: number) => void; // Prop for page change handler
}

const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  onPageChange,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    onPageChange(page); // Call the parent handler when page changes
  };

  const getDisplayedPages = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage > 3 && currentPage < totalPages - 2) {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      }
    }

    return pages;
  };

  return (
    <ul className="inline-flex items-stretch -space-x-px">
      {/* Previous Button */}
      <li>
        <button
          onClick={() => goToPage(currentPage - 1)}
          className="ml-0 flex h-full items-center justify-center rounded-l-lg border border-gray-300 bg-white px-3 py-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          disabled={currentPage === 1}
        >
          <span className="sr-only">Previous</span>
          <ChevronLeftIcon className="size-5" />
        </button>
      </li>

      {/* Page Numbers */}
      {getDisplayedPages().map((page, index) => (
        <li key={index}>
          {page === "..." ? (
            <span className="flex items-center justify-center border border-gray-300 bg-white px-3 py-2 text-sm leading-tight text-gray-500">
              ...
            </span>
          ) : (
            <button
              onClick={() => goToPage(Number(page))}
              aria-current={page === currentPage ? "page" : undefined}
              className={`flex items-center justify-center border px-3 py-2 text-sm leading-tight ${
                page === currentPage
                  ? "z-10 border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                  : "border-gray-300 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              }`}
            >
              {page}
            </button>
          )}
        </li>
      ))}

      {/* Next Button */}
      <li>
        <button
          onClick={() => goToPage(currentPage + 1)}
          className="flex h-full items-center justify-center rounded-r-lg border border-gray-300 bg-white px-3 py-1.5 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          disabled={currentPage === totalPages}
        >
          <span className="sr-only">Next</span>
          <ChevronRightIcon className="size-5" />
        </button>
      </li>
    </ul>
  );
};

export default Pagination;
