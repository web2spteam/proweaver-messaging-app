"use client";
import { useEffect, useState, useCallback } from "react";
import { getData, postData } from "@/app/hooks/useAxios";
import { useModal } from "@/app/context/ModalContext";
import BatchListSkeleton from "@/app/components/skeletons/BatchListSkeleton";
import ModalButton from "../ModalButton";
import { PlusIcon, EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Dropdown } from "flowbite-react";

interface ApiResponse {
    success: boolean;
    message?: string;
}

interface Batch {
    batch_id: number;
    batch_name: string;
    batch_slug: string;
    school_year: string;
}

function BatchList() {
    const { openModal, isOpen } = useModal();

    const [isLoading, setIsLoading] = useState(true);
    const [batchList, setBatchList] = useState<Batch[]>([]);
    const [selectedSchoolYear, setSelectedSchoolYear] = useState<string | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [deleteID, setDeleteID] = useState<number | undefined>(undefined);

    const fetchBatchList = useCallback(async () => {
        try {
            const res: Batch[] = await getData("batch/getBatchList");
            if (res) {
                setBatchList(res);
            }
        } catch (error) {
            console.error("Failed to fetch batch list:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshBatches = useCallback(async () => {
        setIsLoading(true);
        await fetchBatchList();
    }, [fetchBatchList]);

    useEffect(() => {
        fetchBatchList();
    }, [fetchBatchList]);

    useEffect(() => {
        if (!isOpen) {
            refreshBatches();
        }
    }, [isOpen, refreshBatches]);

    const filteredBatchList = batchList.filter((item) => {
        const matchesSchoolYear = selectedSchoolYear
            ? item.school_year === selectedSchoolYear
            : true;
        const matchesSearchTerm = item.batch_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        return matchesSchoolYear && matchesSearchTerm;
    });

    const openDeleteModal = (batch_id: number) => {
        setDeleteID(batch_id);
    };

    const closeDeleteModal = () => {
        setDeleteID(undefined);
    };

    const deleteBatch = async (batch_id: number) => {
        try {
            const result = await postData<ApiResponse, { batch_id: number }>("batch/deleteBatch", {
                batch_id,
            });

            if (result.success) {
                closeDeleteModal();
                refreshBatches();
            } else {
                console.error(result.message);
            }
        } catch (error) {
            console.error("Error occurred while deleting batch:", error);
            closeDeleteModal();
        }
    };

    return (
        <>
            <div className="mb-6 flex items-center justify-between">

                <ModalButton
                    modalType="addNewBatch"
                    onClose={refreshBatches}
                    className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                    <PlusIcon className="mr-1 size-5" />
                    Add New Batch
                </ModalButton>
                <div className="flex items-center space-x-4">
                    <select
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:ring-4 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-800"
                        value={selectedSchoolYear}
                        onChange={(e) => setSelectedSchoolYear(e.target.value)}
                    >
                        <option value="">All School Years</option>
                        {Array.from(new Set(batchList.map((item) => item.school_year))).map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:ring-4 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-800"
                        placeholder="Search by batch name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            {isLoading ? (
                <BatchListSkeleton />
            ) : filteredBatchList.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {filteredBatchList.map((item) => (
                        <div
                            key={item.batch_id}
                            className="rounded-lg border border-gray-200 bg-white py-6 pe-3 ps-6 shadow dark:border-gray-700 dark:bg-gray-800"
                        >
                            <div className="relative flex w-full items-center justify-stretch">
                                <a
                                    href={`/dashboard/students/${item.batch_slug}`}
                                    className="grow"
                                >
                                    <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                        {item.batch_name}
                                    </h5>
                                </a>
                                <div className="shrink-0">
                                    <Dropdown
                                        arrowIcon={false}
                                        inline
                                        label={<EllipsisVerticalIcon className="size-7" />}
                                    >
                                        <Dropdown.Item
                                            className="w-44 px-4 py-2"
                                            onClick={() => openDeleteModal(item.batch_id)}
                                        >
                                            <TrashIcon className="me-2 size-5" />
                                            Delete
                                        </Dropdown.Item>
                                    </Dropdown>
                                </div>
                            </div>
                            <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                                {item.school_year}
                            </p>
                            <a
                                href={`/dashboard/students/${item.batch_slug}`}
                                className="inline-flex items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            >
                                View Students
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
                <div className="flex items-center rounded-lg border border-gray-300 bg-gray-50 p-4 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    <p>No batches found. Add a new batch to get started.</p>
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
                                    ? "Are you sure you want to delete the selected batches?"
                                    : "Are you sure you want to delete this batch?"}
                            </h3>
                            <button
                                onClick={() => deleteBatch(deleteID)}
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

export default BatchList;
