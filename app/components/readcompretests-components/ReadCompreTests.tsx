"use client";
import { Tooltip } from "flowbite-react";
import { PlusIcon, PencilSquareIcon, TrashIcon, ClockIcon, CursorArrowRippleIcon } from "@heroicons/react/24/outline";
import { useParams } from "next/navigation";
import { useModal } from "@/app/context/ModalContext";
import { useCallback, useEffect, useState } from "react";
import { getData, postData } from "@/app/hooks/useAxios";
import QuizzesSkeleton from "../skeletons/QuizzesSkeleton";
import Link from "next/link";

interface ApiResponse {
    success: boolean;
    message?: string;
}

interface ReadCompreTest {
    test_id: number;
    test_title: string;
    no_of_items: number;
    test_time: string;
    expiry_date: string;
    test_status: number | string;
    date_added: string;
}

function ReadCompreTests() {
    const { openModal, isOpen } = useModal();
    const [isLoading, setIsLoading] = useState(true);
    const [readCompreTests, setReadCompreTests] = useState<ReadCompreTest[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteID, setDeleteID] = useState<number | undefined>(undefined);

    // Fetch module read_compre_testzes
    const fetchReadCompreTests = useCallback(async () => {
        try {
            const res: ReadCompreTest[] = await getData(`read_compre_test/getReadCompreTests`);
            if (res) {
                setReadCompreTests(res);
            }
        } catch (error) {
            console.error("Error fetching tests:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Refresh read_compre_testzes
    const refreshReadCompreTests = useCallback(async () => {
        setIsLoading(true);
        await fetchReadCompreTests();
    }, [fetchReadCompreTests]);

    useEffect(() => {
        fetchReadCompreTests();
    }, [fetchReadCompreTests]);

    useEffect(() => {
        if (!isOpen) {
            refreshReadCompreTests();
        }
    }, [isOpen, refreshReadCompreTests]);

    // Filter read_compre_testzes based on search term and selected module
    const filteredReadCompreTests = readCompreTests.filter((read_compre_test) => {
        const matchesSearchTerm = searchTerm === "" || read_compre_test.test_title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearchTerm;
    });

    // Handle opening and closing delete modal
    const openDeleteModal = (test_id: number) => setDeleteID(test_id);
    const closeDeleteModal = () => setDeleteID(undefined);

    // Delete read_compre_test
    const deleteReadCompreTest = async (test_id: number) => {
        try {
            const result = await postData<ApiResponse, any>("read_compre_test/deleteReadCompreTest", { test_id });
            if (result.success) {
                closeDeleteModal();
                refreshReadCompreTests();
            } else {
                console.error(result.message);
            }
        } catch (error) {
            closeDeleteModal();
            console.error("Error deleting reading comprehension test:", error);
        }
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    {/* Module selection dropdown */}
                    {/* <select
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:ring-4 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-800"
                        value={selectedModule ?? ""}
                        onChange={(e) => {
                            const value = e.target.value;
                            console.log(value);
                            
                            setSelectedModule(value === "" ? undefined : parseInt(value, 10));
                        }}
                    >
                        <option value="">All Modules</option>
                        {Array.from(new Set(readCompreTests.map((read_compre_test) => `${read_compre_test.module_id}-${read_compre_test.module_title}`)))
                            .map((moduleInfo, index) => {
                                const [moduleId, moduleTitle] = moduleInfo.split("-");
                                return (
                                    <option key={index} value={moduleId}>
                                        Module {moduleId} - {moduleTitle}
                                    </option>
                                );
                            })}
                    </select> */}

                    {/* Search input */}
                    <input
                        type="text"
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:ring-4 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-800"
                        placeholder="Search by test title"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex justify-end py-4">
                    {/* Add new read_compre_test button */}
                    <Link href={`/dashboard/reading-comprehension-tests/create-test`}>
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto"
                        >
                            <PlusIcon className="-ml-1 mr-2 size-5" />
                            Add New
                        </button>
                    </Link>
                </div>
            </div>

            <div className="mb-20 mt-4">
                {isLoading ? (
                    <QuizzesSkeleton />
                ) : filteredReadCompreTests.length > 0 ? (
                    filteredReadCompreTests.map((read_compre_test) => (
                        <div
                            key={read_compre_test.test_id}
                            className="mb-3 block w-full gap-8 rounded-lg border border-gray-200 bg-white p-3 shadow dark:border-gray-700 dark:bg-gray-800 sm:flex sm:items-center sm:justify-between"
                        >
                            <div className="flex grow flex-col gap-2 sm:flex-row sm:items-center">
                                <p className="w-2/6 text-lg font-semibold text-blue-700 dark:text-blue-500">
                                    {read_compre_test.test_title}
                                    <br />
                                    {/* <span className="text-xs font-normal text-gray-500">
                                        {`${read_compre_test.module_title} - ${read_compre_test.subject_name}`}
                                    </span> */}
                                </p>
                                <p className="w-1/6 text-xs text-gray-500 dark:text-white/50">
                                    <strong>{read_compre_test.no_of_items}</strong> item(s)
                                </p>
                                <p className="w-2/6 text-xs text-gray-500 dark:text-white/50">
                                    Time Duration: <strong>{read_compre_test.test_time}</strong>
                                </p>
                                <p className="w-2/6 text-xs text-gray-500 dark:text-white/50">
                                    Created: <br /> <strong>{read_compre_test.date_added}</strong>
                                </p>
                                <p className="w-2/6 text-xs text-gray-500 dark:text-white/50">
                                    Expiry: <br />{" "}
                                    {read_compre_test.expiry_date ? <strong>{read_compre_test.expiry_date}</strong> : <i className="text-xs">No expiry date set</i>}
                                </p>
                                <span
                                    className={`w-1/6 ${read_compre_test.test_status == 1 ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" : "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300"} me-2 rounded py-0.5 text-center text-xs font-medium`}
                                >
                                    {read_compre_test.test_status == 1 ? "Published" : "Draft"}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                {/* Edit button */}
                                <Tooltip content="Edit">
                                    <Link
                                        href={`/dashboard/reading-comprehension-tests/edit-test/${read_compre_test.test_id}`}
                                        className="inline-flex items-center rounded-lg bg-transparent px-3 py-2 text-center text-sm font-medium text-blue-700 hover:bg-blue-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 dark:text-gray-500 dark:hover:bg-blue-700 dark:hover:text-white dark:focus:ring-blue-800"
                                    >
                                        <PencilSquareIcon className="size-5" />
                                    </Link>
                                </Tooltip>
                                {/* Set expiry button */}
                                <Tooltip content="Set Test Expiry">
                                    <button
                                        onClick={() => openModal("setTestExpiryModal", read_compre_test.test_id)}
                                        type="button"
                                        className="inline-flex items-center rounded-lg bg-transparent px-3 py-2 text-center text-sm font-medium text-orange-700 hover:bg-orange-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-orange-300 dark:text-orange-500 dark:hover:bg-orange-700 dark:hover:text-white dark:focus:ring-orange-800"
                                    >
                                        <ClockIcon className="size-5" />
                                    </button>
                                </Tooltip>
                                <Tooltip content="Assign to Batch">
                                    <button
                                        onClick={() => openModal("assignTestToBatch", read_compre_test.test_id)}
                                        type="button"
                                        className="inline-flex items-center rounded-lg bg-transparent px-3 py-2 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:text-green-500 dark:hover:bg-green-700 dark:hover:text-white dark:focus:ring-green-800"
                                    >
                                        <CursorArrowRippleIcon className="size-5" />
                                    </button>
                                </Tooltip>
                                {/* Delete button */}
                                <Tooltip content="Delete">
                                    <button
                                        onClick={() => openDeleteModal(read_compre_test.test_id)}
                                        type="button"
                                        className="inline-flex items-center rounded-lg bg-transparent px-3 py-2 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:text-red-500 dark:hover:bg-red-700 dark:hover:text-white dark:focus:ring-red-800"
                                    >
                                        <TrashIcon className="size-5" />
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500">No tests available</p>
                )}
            </div>

            {/* Delete Confirmation Modal */}
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
                                    ? "Are you sure you want to delete the selected tests?"
                                    : "Are you sure you want to delete this test?"}
                            </h3>
                            <button
                                onClick={() => deleteReadCompreTest(deleteID)}
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

export default ReadCompreTests;
