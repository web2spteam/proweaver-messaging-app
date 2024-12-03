"use client";
import { Tooltip } from "flowbite-react";
import { PlusIcon, PencilSquareIcon, TrashIcon, ClockIcon } from "@heroicons/react/24/outline";
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

interface Quiz {
    quiz_id: number;
    quiz_title: string;
    no_of_items: number;
    quiz_time: string;
    expiry_date: string;
    quiz_status: number | string;
    date_added: string;
    module_title: string;
    module_id: number;
    subject_name: string;
}

function MyProgress() {
    const { openModal, isOpen } = useModal();
    const [isLoading, setIsLoading] = useState(true);
    const [moduleQuizzes, setModuleQuizzes] = useState<Quiz[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedModule, setSelectedModule] = useState<number | undefined>(undefined);
    const [deleteID, setDeleteID] = useState<number | undefined>(undefined);

    // Fetch module quizzes
    const fetchModuleQuizzes = useCallback(async () => {
        try {
            const moduleIdParam = selectedModule || ""; // Use selectedModule if available
            const res: Quiz[] = await getData(`quiz/getQuizzes/${moduleIdParam}`);
            if (res) {
                setModuleQuizzes(res);
            }
        } catch (error) {
            console.error("Error fetching quizzes:", error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedModule]);

    // Refresh quizzes
    const refreshModuleQuizzes = useCallback(async () => {
        setIsLoading(true);
        await fetchModuleQuizzes();
    }, [fetchModuleQuizzes]);

    useEffect(() => {
        fetchModuleQuizzes();
    }, [fetchModuleQuizzes]);

    useEffect(() => {
        if (!isOpen) {
            refreshModuleQuizzes();
        }
    }, [isOpen, refreshModuleQuizzes]);

    // Filter quizzes based on search term and selected module
    const filteredQuizzes = moduleQuizzes.filter((quiz) => {
        const matchesSearchTerm = searchTerm === "" || quiz.quiz_title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesModule = selectedModule === undefined || quiz.module_id === selectedModule;
        return matchesSearchTerm && matchesModule;
    });

    // Handle opening and closing delete modal
    const openDeleteModal = (quiz_id: number) => setDeleteID(quiz_id);
    const closeDeleteModal = () => setDeleteID(undefined);

    // Delete quiz
    const deleteQuiz = async (quiz_id: number) => {
        try {
            const result = await postData<ApiResponse, any>("quiz/deleteQuiz", { quiz_id });
            if (result.success) {
                closeDeleteModal();
                refreshModuleQuizzes();
            } else {
                console.error(result.message);
            }
        } catch (error) {
            closeDeleteModal();
            console.error("Error deleting quiz:", error);
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
                        {Array.from(new Set(moduleQuizzes.map((quiz) => `${quiz.module_id}-${quiz.module_title}`)))
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
                        placeholder="Search by quiz title"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="mb-20 mt-4">
                {isLoading ? (
                    <QuizzesSkeleton />
                ) : filteredQuizzes.length > 0 ? (
                    filteredQuizzes.map((quiz) => (
                        <div
                            key={quiz.quiz_id}
                            className="mb-3 block w-full gap-8 rounded-lg border border-gray-200 bg-white p-3 shadow dark:border-gray-700 dark:bg-gray-800 sm:flex sm:items-center sm:justify-between"
                        >
                            <div className="flex grow flex-col gap-2 sm:flex-row sm:items-center">
                                <p className="w-2/6 text-lg font-semibold text-blue-700 dark:text-blue-500">
                                    {quiz.quiz_title}
                                    <br />
                                    <span className="text-xs font-normal text-gray-500">
                                        {`${quiz.module_title} - ${quiz.subject_name}`}
                                    </span>
                                </p>
                                <p className="w-1/6 text-sm text-gray-500 dark:text-white/50">
                                    <strong>2/5</strong>
                                </p>
                                <p className="w-1/6 text-sm text-gray-500 dark:text-white/50">
                                    <strong>Quiz</strong>
                                </p>
                                <p className="w-2/6 text-xs text-gray-500 dark:text-white/50">
                                    Date Taken: <br /> <strong>{quiz.date_added}</strong>
                                </p>
                                <span
                                    className={`w-1/6 ${quiz.quiz_status == 1 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"} me-2 rounded py-0.5 text-center text-xs font-medium`}
                                >
                                    {quiz.quiz_status == 1 ? "Passed" : "Failed"}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500">No quizzes available</p>
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
                                    ? "Are you sure you want to delete the selected quizzes?"
                                    : "Are you sure you want to delete this quiz?"}
                            </h3>
                            <button
                                onClick={() => deleteQuiz(deleteID)}
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

export default MyProgress;
