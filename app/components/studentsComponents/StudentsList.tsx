"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { getData, postData } from "@/app/hooks/useAxios";
import { useParams } from "next/navigation";
import { useModal } from "@/app/context/ModalContext";

import Image from "next/image";
import StudentTableSkeleton from "@/app/components/skeletons/StudentTableSkeleton";
import InitialsAvatar from "@/app/components/InitialsAvatar";
import ModalButton from "../ModalButton";
import {
  UserPlusIcon,
  XMarkIcon,
  FunnelIcon,
  ChevronDownIcon,
} from "@heroicons/react/20/solid";
import { Dropdown } from "flowbite-react";
import Pagination from "../Pagination";

// import { encryptText } from "@/plugins/crypto";

interface Student {
  id_number: string;
  fk_account_id: string | null;
  first_name: string;
  middle_name: string;
  last_name: string;
  address: string; // Or you can further define it if needed
  email: string;
  contact_number: string;
  status: string;
  file_path: string | null;
}

interface ApiResponse {
  success: boolean;
  message?: string;
}

function StudentsList() {
  const { openModal, isOpen } = useModal();
  const { batch_slug } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [deleteID, setDeleteID] = useState<string | string[] | null>(null); // Track the currently active modal

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10); // Set items per page
  const [totalStudents, setTotalStudents] = useState<number>(0); // Track the total number of students

  const [sortBy, setSortBy] = useState<string>("id_number");
  const [sortDirection, setSortDirection] = useState<string>("asc");

  const [genderCounts, setGenderCounts] = useState<{
    male: number;
    female: number;
  }>({ male: 0, female: 0 });
  const [statusCounts, setStatusCounts] = useState<{
    newly_registered: number;
    active: number;
    disabled: number;
  }>({ newly_registered: 0, active: 0, disabled: 0 });
  const [error, setError] = useState<string | null>(null); // Error state

  // Filter state
  const [genderFilter, setGenderFilter] = useState<"male" | "female" | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<
    "newly_registered" | "active" | "disabled" | null
  >(null);

  // Bulk Selection state
  const [selectedIDs, setSelectedIDs] = useState<string[] | null>([]);

  useEffect(() => {
    const fetchStudents = async (
      searchItem: string = "",
      page: number = 1,
      limit: number = 10,
    ) => {
      setIsLoading(true);
      setError(null); // Reset error state

      if (!batch_slug) {
        console.error("Batch ID is required");
        setIsLoading(false);
        return;
      }

      try {
        const result: {
          students: Student[];
          total: number;
          genderCounts: { male: number; female: number };
          statusCounts: {
            newly_registered: number;
            active: number;
            disabled: number;
          };
        } = await getData(
          `students/getStudents?batch_slug=${batch_slug}&search=${encodeURIComponent(searchItem)}&page=${page}&limit=${limit}&sort_by=${sortBy}&sort_direction=${sortDirection}`,
        );

        setStudents(result.students);
        setTotalStudents(result.total); // Update total students count
        setGenderCounts(result.genderCounts); // Set gender counts
        setStatusCounts(result.statusCounts); // Set status counts
      } catch (error) {
        console.error("An error occurred fetching students:", error);
        setError("Failed to fetch students. Please try again.");
      } finally {
        setIsLoading(false); // Ensure loading state is always stopped
      }
    };

    fetchStudents(searchTerm, currentPage, itemsPerPage);
  }, [
    batch_slug,
    currentPage,
    searchTerm,
    itemsPerPage,
    sortBy,
    sortDirection,
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    refreshStudents(searchTerm); // Call the refresh function with the search term
  };

  const refreshStudents = useCallback(
    async (searchItem: string, page: number = 1, limit: number = 10) => {
      setIsLoading(true);
      try {
        const filters = [];
        if (genderFilter) filters.push(`gender=${genderFilter}`);
        if (statusFilter) {
          if (statusFilter === "newly_registered") filters.push("status=0");
          else if (statusFilter === "active") filters.push("status=1");
          else if (statusFilter === "disabled") filters.push("status=2");
        }

        const filterString = filters.length > 0 ? `&${filters.join("&")}` : "";

        const result: {
          students: Student[];
          total: number;
          genderCounts: { male: number; female: number };
          statusCounts: {
            newly_registered: number;
            active: number;
            disabled: number;
          };
        } = await getData(
          `students/getStudents?batch_slug=${batch_slug}&search=${encodeURIComponent(searchItem)}&page=${page}&limit=${limit}&sort_by=${sortBy}&sort_direction=${sortDirection}${filterString}`,
        );

        setStudents(result.students);
        setTotalStudents(result.total);
        setGenderCounts(result.genderCounts);
        setStatusCounts(result.statusCounts);
      } catch (error) {
        console.error("An error occurred fetching students:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [batch_slug, genderFilter, statusFilter, sortBy, sortDirection],
  );

  useEffect(() => {
    if (!isOpen) {
      refreshStudents(searchTerm, currentPage, itemsPerPage); // Refresh students when modal closes
    }
  }, [isOpen, refreshStudents, searchTerm, currentPage, itemsPerPage]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    refreshStudents(searchTerm, newPage, itemsPerPage); // Call the refresh function to fetch new page
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      // If the column is already sorted, toggle the direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // If sorting a new column, default to ascending
      setSortBy(column);
      setSortDirection("asc");
    }
    setCurrentPage(1); // Reset to the first page
    refreshStudents(searchTerm, 1, itemsPerPage); // Use refreshStudents to fetch students with updated sort
  };

  // Pagination Logic
  const totalPages = Math.ceil(totalStudents / itemsPerPage);

  // Open the modal for single or bulk deletion
  const openDeleteModal = (id_number: string | string[] | null = null) => {
    setDeleteID(id_number); // Set the student ID(s) for deletion
  };

  // Close the modal
  const closeDeleteModal = () => {
    setDeleteID(null); // Reset the modal state
  };

  // Modify deleteStudent to handle both single and bulk deletion
  const deleteStudent = async (id_numbers: string[] | string | null) => {
    try {
      const data = Array.isArray(id_numbers) ? id_numbers : [id_numbers];
      const result = await postData<ApiResponse, any>(
        "students/deleteStudent",
        { id_numbers: data },
      );

      if (result.success) {
        closeDeleteModal(); // Close the modal after deletion
        refreshStudents(searchTerm, 1, itemsPerPage);
      } else {
        console.error(result.message);
      }
    } catch (error) {
      closeDeleteModal();
      console.error("Error occurred deleting student(s): ", error);
    }
  };

  // For bulk deletion, pass the array of selected IDs to the delete modal
  const handleBulkDelete = () => {
    if (selectedIDs !== null && selectedIDs.length > 0) {
      openDeleteModal(selectedIDs); // Open modal with multiple selected IDs
    } else {
      alert("No students selected.");
    }
  };

  return (
    <div className="relative min-h-[400px] overflow-visible bg-white dark:bg-gray-800 sm:rounded-lg">
      <div className="flex flex-col items-center justify-between space-y-3 p-4 md:flex-row md:space-x-4 md:space-y-0">
        <div className="w-full md:w-1/2">
          <form className="flex items-center" onSubmit={handleSearchSubmit}>
            <label htmlFor="simple-search" className="sr-only">
              Search for students
            </label>
            <div className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  aria-hidden="true"
                  className="size-5 text-gray-500 dark:text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="simple-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                placeholder="Search for students"
              />
            </div>
          </form>
        </div>
        <div className="flex w-full shrink-0 flex-col items-stretch justify-end space-y-2 md:w-auto md:flex-row md:items-center md:space-x-3 md:space-y-0">
          <ModalButton
            modalType="addStudent"
            onClose={() => refreshStudents(searchTerm)}
            className="flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            <UserPlusIcon className="mr-2 size-5" />
            Add student
          </ModalButton>
          <div className="flex w-full items-center space-x-3 md:w-auto">
            {selectedIDs !== null && selectedIDs.length > 0 && (
              <Dropdown
                arrowIcon={false}
                inline
                label={
                  <span className="flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 md:w-auto">
                    <ChevronDownIcon className="-ml-1 mr-1.5 size-5" />
                    Actions
                  </span>
                }
              >
                <Dropdown.Item
                  className="w-40 px-4 py-2"
                  onClick={handleBulkDelete}
                >
                  Delete Selected
                </Dropdown.Item>
              </Dropdown>
            )}
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <span className="flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 md:w-auto">
                  <FunnelIcon className="mr-2 size-4 text-gray-400" />
                  Filter
                  <ChevronDownIcon className="-mr-1 ml-1.5 size-5" />
                </span>
              }
            >
              <Dropdown.Header>
                <span className="block text-sm font-bold">By Gender</span>
              </Dropdown.Header>
              <Dropdown.Item
                onClick={() => {
                  setGenderFilter("male");
                  refreshStudents(searchTerm, currentPage, itemsPerPage);
                }}
              >
                <label>
                  <input
                    type="radio"
                    checked={genderFilter === "male"}
                    onChange={() => {
                      setGenderFilter("male");
                      refreshStudents(searchTerm, currentPage, itemsPerPage);
                    }}
                    className="me-1"
                  />
                  Male ({genderCounts.male})
                </label>
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  setGenderFilter("female");
                  refreshStudents(searchTerm, currentPage, itemsPerPage);
                }}
              >
                <label>
                  <input
                    type="radio"
                    checked={genderFilter === "female"}
                    onChange={() => {
                      setGenderFilter("female");
                      refreshStudents(searchTerm, currentPage, itemsPerPage);
                    }}
                    className="me-1"
                  />
                  Female ({genderCounts.female})
                </label>
              </Dropdown.Item>
              <Dropdown.Header>
                <span className="mt-3 block text-sm font-bold">By Status</span>
              </Dropdown.Header>
              <Dropdown.Item
                onClick={() => {
                  setStatusFilter("newly_registered");
                  refreshStudents(searchTerm, currentPage, itemsPerPage);
                }}
              >
                <label>
                  <input
                    type="radio"
                    checked={statusFilter === "newly_registered"}
                    onChange={() => {
                      setStatusFilter("newly_registered");
                      refreshStudents(searchTerm, currentPage, itemsPerPage);
                    }}
                    className="me-1"
                  />
                  Newly Registered ({statusCounts.newly_registered})
                </label>
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  setStatusFilter("active");
                  refreshStudents(searchTerm, currentPage, itemsPerPage);
                }}
              >
                <label>
                  <input
                    type="radio"
                    checked={statusFilter === "active"}
                    onChange={() => {
                      setStatusFilter("active");
                      refreshStudents(searchTerm, currentPage, itemsPerPage);
                    }}
                    className="me-1"
                  />
                  Active ({statusCounts.active})
                </label>
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  setStatusFilter("disabled");
                  refreshStudents(searchTerm, currentPage, itemsPerPage);
                }}
              >
                <label>
                  <input
                    type="radio"
                    checked={statusFilter === "disabled"}
                    onChange={() => {
                      setStatusFilter("disabled");
                      refreshStudents(searchTerm, currentPage, itemsPerPage);
                    }}
                    className="me-1"
                  />
                  Disabled ({statusCounts?.disabled || 0})
                </label>
              </Dropdown.Item>
              {(genderFilter !== null || statusFilter !== null) && (
                <Dropdown.Item
                  onClick={() => {
                    setGenderFilter(null);
                    setStatusFilter(null);
                    refreshStudents(searchTerm, currentPage, itemsPerPage);
                  }}
                  className="mt-2  text-red-600 dark:text-white"
                >
                  <XMarkIcon className="me-2 size-5 text-red-600 dark:text-white" />
                  Clear Filter
                </Dropdown.Item>
              )}
            </Dropdown>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-4 py-3">
                <div className="flex items-center">
                  <input
                    id="checkbox-all"
                    aria-describedby="checkbox-1"
                    type="checkbox"
                    className="size-4 rounded border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                    onChange={(e) => {
                      if (e.target.checked) {
                        // Select all student IDs when "check all" is checked
                        const allIDs = students.map(
                          (student) => student.id_number,
                        );
                        setSelectedIDs(allIDs);
                      } else {
                        // Clear all selections when "check all" is unchecked
                        setSelectedIDs([]);
                      }
                    }}
                  />
                  <label htmlFor="checkbox-all" className="sr-only">
                    checkbox
                  </label>
                </div>
              </th>
              <th scope="col" className="px-4 py-3">
                <button
                  className="flex w-full items-center justify-between"
                  onClick={() => handleSort("id_number")}
                >
                  <span>ID Number</span>
                  <span>
                    {sortBy === "id_number" &&
                      (sortDirection === "asc" ? "▲" : "▼")}
                  </span>
                </button>
              </th>
              <th scope="col" className="px-4 py-3">
                <button
                  className="flex w-full items-center justify-between"
                  onClick={() => handleSort("last_name")}
                >
                  <span>Name</span>
                  <span>
                    {sortBy === "last_name" &&
                      (sortDirection === "asc" ? "▲" : "▼")}
                  </span>
                </button>
              </th>
              <th scope="col" className="px-4 py-3">
                <button
                  className="flex w-full items-center justify-between"
                  onClick={() => handleSort("contact_number")}
                >
                  <span>Contact Number</span>
                  <span>
                    {sortBy === "contact_number" &&
                      (sortDirection === "asc" ? "▲" : "▼")}
                  </span>
                </button>
              </th>
              <th scope="col" className="px-4 py-3">
                <button
                  className="flex w-full items-center justify-between"
                  onClick={() => handleSort("status")}
                >
                  <span>Status</span>
                  <span>
                    {sortBy === "status" &&
                      (sortDirection === "asc" ? "▲" : "▼")}
                  </span>
                </button>
              </th>

              <th scope="col" className="px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          {isLoading ? (
            <StudentTableSkeleton />
          ) : (
            <tbody>
              {Array.isArray(students) && students.length > 0 ? (
                students.map((student) => (
                  <tr
                    key={student.id_number}
                    className="border-b dark:border-gray-700"
                  >
                    <td className="w-4 px-4 py-3">
                      <div className="flex items-center">
                        <input
                          id={`checkbox-${student.id_number}`}
                          value={student.id_number}
                          aria-describedby={`checkbox-${student.id_number}`}
                          type="checkbox"
                          className="size-4 rounded border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                          checked={
                            selectedIDs !== null &&
                            selectedIDs.includes(student.id_number)
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              // Add the student ID to selectedIDs
                              setSelectedIDs((prev) => [
                                ...(prev || []),
                                student.id_number,
                              ]);
                            } else {
                              // Remove the student ID from selectedIDs
                              setSelectedIDs(
                                (prev) =>
                                  prev?.filter(
                                    (id) => id !== student.id_number,
                                  ) || [],
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={`checkbox-${student.id_number}`}
                          className="sr-only"
                        >
                          checkbox
                        </label>
                      </div>
                    </td>
                    <td className="w-32 px-4 py-3">{student.id_number}</td>
                    <td className="mr-12 flex items-center space-x-6 whitespace-nowrap px-4 py-3">
                      {student.file_path &&
                      student.file_path.startsWith("http") ? (
                        <Image
                          src={student.file_path}
                          alt={`${student.first_name} ${student.last_name} avatar`}
                          className="size-10 rounded-full"
                        />
                      ) : (
                        <InitialsAvatar
                          name={`${student.first_name} ${student.last_name}`}
                        />
                      )}
                      <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        <div className="text-base font-semibold text-gray-900 dark:text-white">
                          {student.last_name}, {student.first_name}{" "}
                          {student.middle_name?.[0] || ""}
                        </div>
                        <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          {student.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{student.contact_number}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`${parseInt(student.status) === 1 ? "bg-green-100" : parseInt(student.status) === 0 ? "bg-gray-100" : "bg-red-100"} 
                                                            ${parseInt(student.status) === 1 ? "text-green-800" : parseInt(student.status) === 0 ? "text-gray-800" : "text-red-800"}
                                                            ${parseInt(student.status) === 1 ? "dark:bg-green-900" : parseInt(student.status) === 0 ? "dark:bg-gray-900" : "dark:bg-red-900"} 
                                                            ${parseInt(student.status) === 1 ? "dark:text-green-300" : parseInt(student.status) === 0 ? "dark:text-gray-300" : "dark:text-red-300"}
                                                                         me-2 rounded px-2.5 py-0.5 text-xs font-medium`}
                      >
                        {parseInt(student.status) === 1
                          ? "Active"
                          : parseInt(student.status) === 0
                            ? "Newly Registered"
                            : "Disabled"}
                      </span>
                    </td>
                    <td className="flex items-center justify-end px-4 py-3">
                      <Dropdown
                        arrowIcon={false}
                        inline
                        label={
                          <svg
                            className="size-5"
                            aria-hidden="true"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                          </svg>
                        }
                      >
                        <Dropdown.Item
                          href={`/dashboard/students/${batch_slug}/${student.id_number}`}
                          className="w-44 px-4 py-2"
                        >
                          View Details
                        </Dropdown.Item>
                        <Dropdown.Item
                          className="w-44 px-4 py-2"
                          onClick={() =>
                            openModal("editStudentModal", student.id_number)
                          }
                        >
                          Edit Details
                        </Dropdown.Item>
                        <Dropdown.Item
                          className="w-44 px-4 py-2"
                          onClick={() => openDeleteModal(student.id_number)}
                        >
                          Delete
                        </Dropdown.Item>
                      </Dropdown>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-4 text-center" colSpan={6}>
                    No entries found
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </div>
      {Array.isArray(students) && students.length > 0 && (
        <nav
          className="flex items-center justify-between p-4"
          aria-label="Table navigation"
        >
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            Showing{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {Math.min(currentPage * itemsPerPage, totalStudents)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {totalStudents}
            </span>
          </span>
          <Pagination totalPages={totalPages} onPageChange={handlePageChange} />
        </nav>
      )}
      {deleteID && (
        <div
          id={`popup-modal-${deleteID}`}
          tabIndex={-1}
          className="fixed inset-0 z-50 flex size-full items-center justify-center bg-gray-800/50"
        >
          <div className="relative rounded-lg bg-white p-6 shadow dark:bg-gray-700">
            <button
              type="button"
              onClick={closeDeleteModal}
              className="absolute end-2.5 top-3 ms-auto inline-flex size-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              {/* SVG close icon */}
            </button>
            <div className="text-center">
              <svg
                className="mx-auto mb-4 size-12 text-gray-400 dark:text-gray-200"
                aria-hidden="true"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                {Array.isArray(deleteID)
                  ? "Are you sure you want to delete the selected students?"
                  : "Are you sure you want to delete this student?"}
              </h3>
              <button
                onClick={() => deleteStudent(deleteID)}
                className="inline-flex items-center rounded-lg bg-red-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800"
              >
                Yes, I&#39;m sure
              </button>
              <button
                onClick={closeDeleteModal}
                className="ml-3 border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                No, cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentsList;
