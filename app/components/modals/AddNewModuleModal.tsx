"use client";
import { FC, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { postData } from "@/app/hooks/useAxios";
import { useRouter, useParams } from "next/navigation";

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
  subject_id: string | number | string[];
  module_title: string;
}

const AddNewModuleModal: FC<ModalProps> = ({ isOpen, onClose }) => {
  const { subject_id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [moduleTitle, setModuleTitle] = useState<string>("");

  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );
  const [moduleTitleError, setModuleTitleError] = useState<string | undefined>(
    "",
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let isValid = true;

    // Clear existing error
    setModuleTitleError(undefined);
    setErrorMessage(undefined);

    // Validate batch name
    if (!moduleTitle) {
      setModuleTitleError("Module name is required.");
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    let formData: FormData = {
      subject_id: subject_id,
      module_title: moduleTitle,
    };

    try {
      setIsLoading(true);
      const result = await postData<ApiResponse, any>(
        "subject_modules/addModule",
        formData,
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

  return (
    <>
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
        <div className="relative size-full max-w-2xl px-4 md:h-auto">
          {/* Modal content */}
          <div className="relative rounded-lg bg-white shadow dark:bg-gray-800">
            {/* Modal header */}
            <div className="flex items-start justify-between rounded-t border-b p-5 dark:border-gray-700">
              <h3 className="text-xl font-semibold dark:text-white">
                Add New Module
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
                  <div className="col-span-1 sm:col-span-3">
                    <label
                      htmlFor="module-title"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Module Title
                    </label>
                    <input
                      type="text"
                      id="module-title"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                      placeholder="Enter module title"
                      value={moduleTitle}
                      onChange={(e) => {
                        setModuleTitle(e.target.value);
                      }}
                    />
                    {moduleTitleError && (
                      <p className="text-xs text-red-400">{moduleTitleError}</p>
                    )}
                  </div>
                </div>
              </div>
              {/* Modal footer */}
              <div className="items-center rounded-b border-t border-gray-200 p-6 text-end dark:border-gray-700">
                <button
                  className="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  type="submit"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddNewModuleModal;
