"use client";
import { Tooltip } from "flowbite-react";
import { PlusIcon, PencilSquareIcon, TrashIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useParams } from 'next/navigation';
import { useModal } from "@/app/context/ModalContext";
import { useCallback, useEffect, useState } from "react";
import { getData, postData } from "@/app/hooks/useAxios";
import QuizzesSkeleton from "../skeletons/QuizzesSkeleton";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

interface ApiResponse {
    success: boolean;
    message?: string;
}

function Quizzes() {
    const { userType } = useAuth();
    const { openModal, isOpen } = useModal();
    const { module_id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [moduleQuizzes, setModuleQuizzes] = useState<
        {
            quiz_id: number;
            quiz_title: string;
            no_of_items: number;
            quiz_time: string;
            expiry_date: string;
            quiz_status: number | string;
            date_added: string;
        }[]
    >([]);

    const [deleteID, setDeleteID] = useState<number | undefined>(undefined);

    const fetchModuleQuizzes = useCallback(async () => {
        try {
            const res: [] = await getData(
                `quiz/getQuizzes/${module_id}`,
            );
            if (res) {
                setModuleQuizzes(res);
            }
        } catch (error) {
            console.error("An error occurred fetching module quizzes:", error);
        } finally {
            setIsLoading(false);
        }
    }, [module_id]);

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

    const openDeleteModal = (quiz_id: number) => {
        setDeleteID(quiz_id);
    };

    const closeDeleteModal = () => {
        setDeleteID(undefined);
    };

    const deleteQuiz = async (quiz_id: number) => {
        try {
            const result = await postData<ApiResponse, any>(
                "quiz/deleteQuiz",
                { quiz_id: quiz_id },
            );

            if (result.success) {
                closeDeleteModal();
                refreshModuleQuizzes();
            } else {
                console.error(result.message);
            }
        } catch (error) {
            closeDeleteModal();
            console.error("Error occurred deleting quiz: ", error);
        }
    };

    const filteredQuizzes = userType == 2
        ? moduleQuizzes.filter((quiz) => quiz.quiz_status == 1)
        : moduleQuizzes;

    return (
        <>
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium tracking-tight text-gray-700 dark:text-white/75">
                    Quizzes
                </h2>
                {userType != 2 && (
                    <div className="flex justify-end py-4">
                        <a href={`/dashboard/modules/${module_id}/create-quiz`}>
                            <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto"
                            >
                                <PlusIcon className="-ml-1 mr-2 size-5" />
                                Add New
                            </button>
                        </a>
                    </div>)}
            </div>
            <div className="mb-20 mt-4">
                {isLoading ? (
                    <QuizzesSkeleton />
                ) : filteredQuizzes.length > 0 ? (
                    filteredQuizzes.map((quiz) => (
                        <div key={quiz.quiz_id} className="mb-3 flex w-full justify-between gap-8 rounded-lg border border-gray-200 bg-white p-5 shadow dark:border-gray-700 dark:bg-gray-800 sm:items-center">
                            <div className="flex grow flex-col justify-between sm:flex-row sm:items-center">
                                <p className="w-2/6 text-lg font-semibold text-blue-700 dark:text-blue-500">
                                    {quiz.quiz_title}
                                </p>
                                <p className="w-1/6 text-sm text-gray-500 dark:text-white/50">
                                    {quiz.no_of_items} item(s)
                                </p>
                                <p className="w-2/6 text-sm text-gray-500 dark:text-white/50">
                                    Time Duration: {quiz.quiz_time}
                                </p>
                                <p className="w-2/6 text-sm text-gray-500 dark:text-white/50">
                                    Created:<br /> {quiz.date_added}
                                </p>
                                <p className="w-2/6 text-sm text-gray-500 dark:text-white/50">
                                    Expiry:<br /> {quiz.expiry_date ? quiz.expiry_date : <i className="text-xs">No expiry date set</i>}
                                </p>
                                {userType != 2 && (
                                    <p>
                                        <span
                                            className={`w-1/6 ${quiz.quiz_status === 1 ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" : "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300"} me-2 rounded px-2.5 py-0.5 text-xs font-medium`}
                                        >
                                            {quiz.quiz_status === 1 ? "Published" : "Draft"}
                                        </span>
                                    </p>
                                )}
                            </div>
                            <div className="inline-flex">
                                {userType != 2 ? (
                                    <>
                                        <Tooltip content="Edit">
                                            <Link
                                                href={`/dashboard/modules/${module_id}/edit-quiz/${quiz.quiz_id}`}
                                                className="inline-flex items-center rounded-lg bg-transparent px-3 py-2 text-center text-sm font-medium text-blue-700 hover:bg-blue-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 dark:text-gray-500 dark:hover:bg-blue-700 dark:hover:text-white dark:focus:ring-blue-800"
                                            >
                                                <PencilSquareIcon className="size-5" />
                                            </Link>
                                        </Tooltip>
                                        <Tooltip content="Set Quiz Expiry">
                                            <button
                                                onClick={() => openModal("setQuizExpiryModal", quiz.quiz_id)}
                                                type="button"
                                                className="inline-flex items-center rounded-lg bg-transparent px-3 py-2 text-center text-sm font-medium text-orange-700 hover:bg-orange-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-orange-300 dark:text-orange-500 dark:hover:bg-orange-700 dark:hover:text-white dark:focus:ring-orange-800"
                                            >
                                                <ClockIcon className="size-5" />
                                            </button>
                                        </Tooltip>
                                        <Tooltip content="Delete">
                                            <button
                                                onClick={() => openDeleteModal(quiz.quiz_id)}
                                                type="button"
                                                className="inline-flex items-center rounded-lg bg-transparent px-3 py-2 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:text-gray-500 dark:hover:bg-red-700 dark:hover:text-white dark:focus:ring-red-800"
                                            >
                                                <TrashIcon className="size-5" />
                                            </button>
                                        </Tooltip>
                                    </>
                                ) : (
                                    <a href={`/dashboard/modules/${module_id}/take-quiz/${quiz.quiz_id}`}>
                                        <button
                                            type="button"
                                            className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto"                                            >
                                            Take Quiz
                                        </button>
                                    </a>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No quizzes available.</p>
                )}
            </div>
        </>
    );
}

export default Quizzes;
