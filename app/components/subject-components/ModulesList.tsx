"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { getData, postData } from "@/app/hooks/useAxios";
import { useModal } from "@/app/context/ModalContext";
import BatchListSkeleton from "@/app/components/skeletons/BatchListSkeleton";
import ModalButton from "../ModalButton";
import { PlusIcon, EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Dropdown } from "flowbite-react";
import { useAuth } from "@/app/context/AuthContext";

interface ApiResponse {
    success: boolean;
    message?: string;
}

function ModulesList() {
    const { userType } = useAuth();
    const { subject_id } = useParams();
    const { openModal, isOpen } = useModal();
    const [isLoading, setIsLoading] = useState(true);
    const [modules, setModules] = useState<{ module_id: number; module_title: string }[]>([]);
    const [filteredModules, setFilteredModules] = useState(modules); // Store filtered modules
    const [deleteID, setDeleteID] = useState<number | undefined>(undefined);
    const [filterText, setFilterText] = useState(""); // For filtering modules by title

    const fetchModules = useCallback(async () => {
        try {
            const res: [] = await getData(`subject_modules/getSubjectModules/${subject_id}`);
            if (res) {
                setModules(res);
                setFilteredModules(res); // Initialize filtered modules when data is fetched
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [subject_id]);

    const refreshModules = useCallback(async () => {
        setIsLoading(true);
        await fetchModules();
    }, [fetchModules]);

    useEffect(() => {
        fetchModules();
    }, [fetchModules]);

    useEffect(() => {
        if (!isOpen) {
            refreshModules();
        }
    }, [isOpen, refreshModules]);

    // Filter modules by title
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFilterText(value);
        setFilteredModules(
            modules.filter((module) =>
                module.module_title.toLowerCase().includes(value.toLowerCase())
            )
        );
    };

    // Open the modal for single or bulk deletion
    const openDeleteModal = (module_id: number) => {
        setDeleteID(module_id); // Set the module ID for deletion
    };

    // Close the modal
    const closeDeleteModal = () => {
        setDeleteID(undefined); // Reset the modal state
    };

    const deleteModule = async (module_id: number) => {
        try {
            const result = await postData<ApiResponse, any>("modules/deleteModule", {
                module_id: module_id,
            });

            if (result.success) {
                closeDeleteModal(); // Close the modal after deletion
                refreshModules(); // Refresh the module list
            } else {
                console.error(result.message);
            }
        } catch (error) {
            closeDeleteModal();
            console.error("Error occurred deleting module: ", error);
        }
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-gray-700 dark:text-white/75">
                    Modules
                </h2>
                <div className="flex items-center justify-end space-x-4 py-4">
                    {/* Filter input */}
                    <div className="py-4">
                        <input
                            type="text"
                            value={filterText}
                            onChange={handleFilterChange}
                            placeholder="Search Modules..."
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:ring-4 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-800"
                        />
                    </div>
                    {userType != 2 && (
                        <div>
                        <ModalButton
                            modalType="addNewModule"
                            onClose={() => refreshModules()}
                            className="flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                            <PlusIcon className="mr-2 size-5" />
                            Add New
                        </ModalButton>
                    </div>
                    )}
                    
                </div>
            </div>



            {isLoading ? (
                <BatchListSkeleton />
            ) : filteredModules.length > 0 ? (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {filteredModules.map((item) => (
                        <div
                            key={item.module_id}
                            className="rounded-lg border border-gray-200 bg-white py-6 pe-3 ps-6 shadow dark:border-gray-700 dark:bg-gray-800"
                        >
                            <div className="relative flex w-full items-center justify-stretch">
                                <a
                                    href={`/dashboard/modules/${item.module_id}`}
                                    className="grow"
                                >
                                    <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                        {item.module_title}
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
                                            onClick={() => openDeleteModal(item.module_id)}
                                        >
                                            <TrashIcon className="me-2 size-5" />
                                            Delete
                                        </Dropdown.Item>
                                    </Dropdown>
                                </div>
                                )}
                                

                            </div>
                            <a
                                href={`/dashboard/modules/${item.module_id}`}
                                className="mt-5 inline-flex items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            >
                                Open Module
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
                    <svg
                        className="me-3 inline size-4 shrink-0"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                    </svg>
                    <span className="sr-only">Info</span>
                    <div>
                        <span className="font-medium">No modules have been added yet.</span>
                        {userType != 2 && (
                        <a
                            className="ml-1 cursor-pointer font-normal text-blue-600 hover:underline dark:text-blue-500"
                            onClick={() => openModal("addNewModule")}
                        >
                            Add New
                        </a>)}
                    </div>
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
                                    ? "Are you sure you want to delete the selected modules?"
                                    : "Are you sure you want to delete this module?"}
                            </h3>
                            <button
                                onClick={() => deleteModule(deleteID)}
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

export default ModulesList;