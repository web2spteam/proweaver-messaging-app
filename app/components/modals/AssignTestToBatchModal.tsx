"use client";
import { FC, useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { postData, getData } from "@/app/hooks/useAxios";
import DangerAlert from "../DangerAlert";
import DismissableToast from "../DismissableToast";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    testId: string | number | undefined;
}

interface ApiResponse {
    success: boolean;
    message?: string;
}

interface Batch {
    batch_id: string | number;
    batch_name: string;
}

type ToastMessage = { type: string; message: string };

const AssignTestToBatchModal: FC<ModalProps> = ({ isOpen, onClose, testId }) => {
    const [loading, setLoading] = useState(true);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<string | number | "">("");
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    const [message, setMessage] = useState<ToastMessage | null>(null);
    const [toastKey, setToastKey] = useState<number>(0);

    useEffect(() => {
        if (isOpen) {
            fetchBatches();
        }
    }, [isOpen]);

    const fetchBatches = async () => {
        try {
            setLoading(true);
            const response = await getData<Batch[]>("batch/getAll");
            setBatches(response);
        } catch (error) {
            console.error("Error fetching batches:", error);
            setErrorMessage("Failed to load batches.");
        } finally {
            setLoading(false);
        }
    };

    const checkIfAlreadyAssigned = async () => {
        try {
            const response = await postData<ApiResponse, any>("read_compre_test/checkAssignment", {
                test_id: testId,
                batch_id: selectedBatch,
            });

            return response.success; // Assume `success: true` means already assigned
        } catch (error) {
            console.error("Error checking assignment: ", error);
            setErrorMessage("Unable to validate assignment. Please try again.");
            showMessage({
                type: "danger",
                message: "Unable to validate assignment. Please try again.",
            });
            return false;
        }
    };

    const handleAssign = async () => {
        setErrorMessage(undefined);

        if (!selectedBatch) {
            setErrorMessage("Please select a batch.");
            return;
        }

        try {
            setIsSubmitting(true);
            const result = await postData<ApiResponse, any>("read_compre_test/assignTestToBatch", {
                test_id: testId,
                batch_id: selectedBatch,
            });
            if (result.success) {
                showMessage({
                    type: "success",
                    message: result.message || "Test has been successfully assigned to batch.",
                });
                setIsConfirmationOpen(false);
                onClose();
            } else {
                setErrorMessage(result.message);
                showMessage({
                    type: "danger",
                    message: result.message || "An error occurred while assigning test.",
                });
            }
        } catch (error) {
            setErrorMessage("An unexpected error occurred. Please try again.");
            showMessage({
                type: "danger",
                message: "An unexpected error occurred. Please try again.",
            });
            console.error("Error assigning batch: ", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openConfirmationModal = async () => {
        setErrorMessage(undefined);

        if (!selectedBatch) {
            setErrorMessage("Please select a batch.");
            return;
        }

        const isAlreadyAssigned = await checkIfAlreadyAssigned();
        if (isAlreadyAssigned) {
            setErrorMessage("This test is already assigned to the selected batch.");
            showMessage({
                type: "danger",
                message: "This test is already assigned to the selected batch.",
            });
        } else {
            setIsConfirmationOpen(true);
        }
    };

    const closeConfirmationModal = () => {
        setIsConfirmationOpen(false);
    };

    const showMessage = (newMessage: { type: string; message: string }) => {
        setMessage(newMessage);
        setToastKey((prevKey: number) => prevKey + 1);
    };

    return (
        <>
            {message?.message && (
                <DismissableToast
                    key={toastKey}
                    type={message.type || ""}
                    message={message.message || ""}
                />
            )}
            <div
                className="fixed inset-0 bg-gray-600/50"
                aria-hidden="true"
                onClick={onClose}
            ></div>
            <div
                className="fixed inset-x-0 top-4 z-50 flex h-modal items-center justify-center overflow-y-auto overflow-x-hidden sm:h-full md:inset-0"
                aria-modal="true"
                role="dialog"
            >
                <div className="relative size-full max-w-md px-4 md:h-auto">
                    <div className="relative rounded-lg bg-white shadow dark:bg-gray-800">
                        <div className="flex items-start justify-between rounded-t border-b p-5 dark:border-gray-700">
                            <h3 className="text-xl font-semibold dark:text-white">
                                Assign Test to Batch
                            </h3>
                            <button
                                type="button"
                                className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
                                onClick={onClose}
                            >
                                <XMarkIcon className="size-5" />
                            </button>
                        </div>
                        <div className="space-y-6 p-6">
                            {errorMessage && <DangerAlert title={errorMessage} />}
                            <div className="grid grid-cols-1 gap-6">
                                <div className="col-span-1 sm:col-span-3">
                                    <label
                                        htmlFor="batch"
                                        className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                        Select Batch
                                    </label>
                                    <select
                                        id="batch"
                                        value={selectedBatch}
                                        onChange={(e) => setSelectedBatch(e.target.value)}
                                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                                    >
                                        <option value="" disabled>
                                            Select a batch
                                        </option>
                                        {batches.map((batch) => (
                                            <option key={batch.batch_id} value={batch.batch_id}>
                                                {batch.batch_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="items-center rounded-b border-t border-gray-200 p-6 text-end dark:border-gray-700">
                            <button
                                type="button"
                                onClick={openConfirmationModal}
                                className="inline-flex w-full justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                disabled={isSubmitting}
                            >
                                Assign to Batch
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isConfirmationOpen && (
                <div
                    className="fixed inset-0 z-50 flex size-full items-center justify-center bg-gray-800/50"
                    aria-modal="true"
                >
                    <div className="relative rounded-lg bg-white p-6 text-center shadow dark:bg-gray-700">
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
                            Are you sure you want to assign this subject to the selected batch?
                        </h3>
                        <button
                            onClick={handleAssign}
                            className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                            Yes, Assign
                        </button>
                        <button
                            onClick={closeConfirmationModal}
                            className="ml-3 border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                        >
                            No, Cancel
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AssignTestToBatchModal;
