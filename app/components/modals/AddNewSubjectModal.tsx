"use client";
import { FC, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { postData } from "@/app/hooks/useAxios";
import { useRouter } from "next/navigation";

import DangerAlert from "../DangerAlert";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ApiResponse {
    success: boolean;
    message?: string;
}

interface FormData {
    subject_name: string;
    days: string[];
    fromTime: string;
    toTime: string;
}

const AddNewSubjectModal: FC<ModalProps> = ({ isOpen, onClose }) => {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [subjectName, setSubjectName] = useState<string>("");
    const [days, setDays] = useState<string[]>([]); // Days selection
    const [timeFrom, setTimeFrom] = useState<string>(""); // Start time
    const [timeTo, setTimeTo] = useState<string>(""); // End time

    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
    const [subjectNameError, setSubjectNameError] = useState<string | undefined>("");

    const [isLoading, setIsLoading] = useState<boolean>(false);

    if (!isOpen) return null;

    const handleDayChange = (day: string) => {
        setDays((prevDays) =>
            prevDays.includes(day)
                ? prevDays.filter((d) => d !== day)
                : [...prevDays, day]
        );
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        let isValid = true;

        // Clear existing error
        setSubjectNameError(undefined);
        setErrorMessage(undefined);

        // Validate subject name
        if (!subjectName) {
            setSubjectNameError("Subject name is required.");
            isValid = false;
        }

        // Validate days and times
        if (days.length === 0) {
            setErrorMessage("At least one day is required.");
            isValid = false;
        }

        if (!timeFrom || !timeTo) {
            setErrorMessage("Time range (From and To) is required.");
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        // Structure the form data as per the desired format
        const formData: FormData = {
            subject_name: subjectName,
            days, // Array of selected days
            fromTime: convertTo12HourFormat(timeFrom), // From time
            toTime: convertTo12HourFormat(timeTo), // To time
        };

        try {
            setIsLoading(true);
            const result = await postData<ApiResponse, any>(
                "subjects/addSubject",
                formData
            );
            if (result.success) {
                onClose();
            } else {
                setIsLoading(false);
                setErrorMessage(result.message);
            }
        } catch (error) {
            setErrorMessage("An unexpected error occurred. Please try again.");
            console.error("Error occurred adding subject: ", error);
        }
    };

    // Helper function to handle 12-hour format conversion (AM/PM)
    const convertTo12HourFormat = (time: string) => {
        const [hour, minute] = time.split(":");
        let hours = parseInt(hour, 10);
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12; // 12-hour format
        return `${hours}:${minute} ${ampm}`;
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-gray-600/50"
                aria-hidden="true"
                onClick={onClose}
            ></div>
            <div
                className="fixed inset-x-0 top-4 z-50 flex h-modal items-center justify-center overflow-y-auto overflow-x-hidden sm:h-full md:inset-0"
                id="add-user-modal"
                aria-modal="true"
                role="dialog"
            >
                <div className="relative size-full max-w-2xl px-4 md:h-auto">
                    {/* Modal content */}
                    <div className="relative rounded-lg bg-white shadow dark:bg-gray-800">
                        {/* Modal header */}
                        <div className="flex items-start justify-between rounded-t border-b p-5 dark:border-gray-700">
                            <h3 className="text-xl font-semibold dark:text-white">
                                Add New Subject
                            </h3>
                            <button
                                type="button"
                                className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
                                onClick={onClose}
                            >
                                <XMarkIcon className="size-5" />
                            </button>
                        </div>
                        {/* Modal body */}
                        <form method="POST" onSubmit={handleSubmit}>
                            <div className="space-y-6 p-6">
                                {errorMessage && <DangerAlert title={errorMessage} />}
                                <div className="grid grid-cols-1 gap-6">
                                    {/* Subject Name Input */}
                                    <div className="col-span-1 sm:col-span-3">
                                        <label
                                            htmlFor="subject-name"
                                            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Subject Name
                                        </label>
                                        <input
                                            type="text"
                                            id="subject-name"
                                            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                                            placeholder="Enter subject name"
                                            value={subjectName}
                                            onChange={(e) => setSubjectName(e.target.value)}
                                        />
                                        {subjectNameError && (
                                            <p className="text-xs text-red-400">{subjectNameError}</p>
                                        )}
                                    </div>

                                    {/* Days Selection */}
                                    <div className="col-span-1 sm:col-span-3">
                                        <label
                                            htmlFor="days"
                                            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Days
                                        </label>
                                        <div className="flex space-x-4">
                                            {["SU", "M", "T", "W", "TH", "F", "S"].map((day) => (
                                                <label key={day} className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        value={day}
                                                        checked={days.includes(day)}
                                                        onChange={() => handleDayChange(day)}
                                                        className="size-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-500"
                                                    />
                                                    <span className="ml-2 text-sm">{day}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Time Selection */}
                                    <div className="col-span-1 grid grid-cols-2 gap-4 sm:col-span-3">
                                        <div>
                                            <label
                                                htmlFor="time-from"
                                                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                                            >
                                                From
                                            </label>
                                            <input
                                                type="time"
                                                id="time-from"
                                                value={timeFrom}
                                                onChange={(e) => setTimeFrom(e.target.value)}
                                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="time-to"
                                                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                                            >
                                                To
                                            </label>
                                            <input
                                                type="time"
                                                id="time-to"
                                                value={timeTo}
                                                onChange={(e) => setTimeTo(e.target.value)}
                                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Modal footer */}
                            <div className="items-center rounded-b border-t border-gray-200 p-6 text-end dark:border-gray-700">
                                <button
                                    type="submit"
                                    className="inline-flex w-full justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Adding..." : "Add Subject"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddNewSubjectModal;
