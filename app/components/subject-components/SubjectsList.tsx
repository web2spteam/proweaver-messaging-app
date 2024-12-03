"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { useModal } from "@/app/context/ModalContext";
import ModalButton from "../ModalButton";
import BatchListSkeleton from "@/app/components/skeletons/BatchListSkeleton";
import { PlusIcon, EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { CursorArrowRippleIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { getData, postData } from "@/app/hooks/useAxios";
import { Dropdown } from "flowbite-react";

interface ApiResponse {
    success: boolean;
    message?: string;
}

function SubjectsList() {
    const { userType } = useAuth();
    const { openModal, isOpen } = useModal();
    const [isLoading, setIsLoading] = useState(true);
    const [subjectList, setSubjectList] = useState<
        { subject_id: number; subject_name: string, schedule: string }[]
    >([]);
    const [filteredSubjects, setFilteredSubjects] = useState<
        { subject_id: number; subject_name: string, schedule: string  }[]
    >([]);
    const [searchQuery, setSearchQuery] = useState<string>("");

    const [deleteID, setDeleteID] = useState<number | undefined>(undefined);

    const fetchSubjects = useCallback(async () => {
        try {
            const res: [] = await getData("subjects/getSubjects");
            if (res) {
                setSubjectList(res);
                setFilteredSubjects(res); // Initialize with full data
            }
        } catch (error) {
            console.error("An error occurred fetching subjects:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshSubjects = useCallback(async () => {
        setIsLoading(true);
        await fetchSubjects();
    }, [fetchSubjects]);

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    useEffect(() => {
        if (!isOpen) {
            refreshSubjects();
        }
    }, [isOpen, refreshSubjects]);

    // Filtering logic
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredSubjects(subjectList);
        } else {
            const filtered = subjectList.filter((subject) =>
                subject.subject_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredSubjects(filtered);
        }
    }, [searchQuery, subjectList]);

    // Open the modal for deletion
    const openDeleteModal = (subject_id: number) => {
        setDeleteID(subject_id);
    };

    const closeDeleteModal = () => {
        setDeleteID(undefined);
    };

    const deleteSubject = async (subject_id: number) => {
        try {
            const result = await postData<ApiResponse, any>(
                "subjects/deleteSubject",
                { subject_id: subject_id }
            );

            if (result.success) {
                closeDeleteModal();
                refreshSubjects();
            } else {
                console.error(result.message);
            }
        } catch (error) {
            closeDeleteModal();
            console.error("Error occurred deleting subject(s): ", error);
        }
    };

    return (
        <>
            <div className="mb-6 block sm:flex sm:items-center sm:justify-between">
                {userType != 2 && (
                    <ModalButton
                        modalType="addNewSubject"
                        onClose={() => refreshSubjects()}
                        className="mb-6 flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                        <PlusIcon className="mr-2 size-5" />
                        Add Subject
                    </ModalButton>
                )}

                {/* Search Bar */}
                <div className="w-full sm:w-1/3">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search subjects..."
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    />
                </div>
            </div>
            {isLoading ? (
                <BatchListSkeleton />
            ) : filteredSubjects.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {filteredSubjects.map((item) => (
                        <div
                            key={item.subject_id}
                            className="rounded-lg border border-gray-200 bg-white py-6 pe-3 ps-6 shadow dark:border-gray-700 dark:bg-gray-800"
                        >
                            <div className="relative flex w-full items-center justify-stretch">
                                <a
                                    href={`/dashboard/students/${item.subject_id}`}
                                    className="grow"
                                >
                                    <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                        {item.subject_name}
                                    </h5>
                                </a>
                                {userType != 2 && (
                                    <div className="shrink-0">
                                        <Dropdown
                                            arrowIcon={false}
                                            inline
                                            label={<EllipsisVerticalIcon className="size-7" />}
                                        >
                                            <Dropdown.Item
                                                className="w-44 px-4 py-2"
                                                onClick={() => openModal("assignSubjectToBatch", item.subject_id)}
                                            >
                                                <CursorArrowRippleIcon className="me-2 size-5" />
                                                Assign to Batch
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                className="w-44 px-4 py-2"
                                                onClick={() => openModal("editSubject", item.subject_id)}
                                            >
                                                <PencilSquareIcon className="me-2 size-5" />
                                                Update
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                className="w-44 px-4 py-2"
                                                onClick={() => openDeleteModal(item.subject_id)}
                                            >
                                                <TrashIcon className="me-2 size-5" />
                                                Delete
                                            </Dropdown.Item>
                                        </Dropdown>
                                    </div>
                                )}
                            </div>
                            <p className="my-3 text-sm text-gray-500">{item.schedule}</p>
                            <a
                                href={`/dashboard/subjects/${item.subject_id}`}
                                className="mt-5 inline-flex items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            >
                                View Modules
                                <svg
                                    className="ms-2 size-3.5 rtl:rotate-180"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 14 10"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M1 5h12m0 0L9 1m4 4L9 9"
                                    />
                                </svg>
                            </a>
                        </div>
                    ))}
                </div>
            ) : (
                <div
                    className="flex items-center rounded-lg border border-gray-300 bg-gray-50 p-4 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    role="alert"
                >
                    <span className="font-medium">No subjects match your search.</span>
                </div>
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
                                    ? "Are you sure you want to delete the selected subjects?"
                                    : "Are you sure you want to delete this subject?"}
                            </h3>
                            <button
                                onClick={() => deleteSubject(deleteID)}
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
        </>
    );
}

export default SubjectsList;
