"use client";
import { FC, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Datepicker } from "flowbite-react";
import { postData } from "../../hooks/useAxios";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizId: string | number | undefined;
}

interface ApiResponse {
  success: boolean;
  message?: string;
}

interface FormData {
  quiz_id: string | number | undefined;
  expiry_date: string;
}

const SetQuizExpiryModal: FC<ModalProps> = ({ isOpen, onClose, quizId}) => {
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(undefined);

    if (!expiryDate) {
      setErrorMessage("Expiry date is required.");
      setIsLoading(false);
      return;
    }

    const formattedExpiryDate = expiryDate.toISOString().split('T')[0];

    const formData: FormData = {
      quiz_id: quizId,
      expiry_date: formattedExpiryDate,
    };

    try {
      const result = await postData<ApiResponse, any>("quiz/setExpiryDate", formData);
      if (result.success) {
        onClose();
      } else {
        setErrorMessage(result.message || "An error occurred.");
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      console.error("Error setting expiry date:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-600/50" aria-hidden="true" onClick={onClose}></div>
      <div className="fixed inset-x-0 top-4 z-50 flex h-modal items-center justify-center overflow-y-auto overflow-x-hidden sm:h-full md:inset-0" aria-modal="true" role="dialog">
        <div className="relative size-full max-w-md px-4 md:h-auto">
          <div className="relative rounded-lg bg-white shadow dark:bg-gray-800">
            <div className="flex items-start justify-between rounded-t border-b p-5 dark:border-gray-700">
              <h3 className="text-xl font-semibold dark:text-white">Set Quiz Expiry</h3>
              <button type="button" className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white" onClick={onClose}>
                <XMarkIcon className="size-5" />
              </button>
            </div>
            <form method="POST" onSubmit={handleSubmit}>
              <div className="space-y-6 p-6">
                {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                <div id="customDatePickerContainer" className="relative max-w-sm">
                  <label htmlFor="expiry-date" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Expiry Date</label>
                  <Datepicker 
                  id="expiry-date" 
                  minDate={new Date()}
                  color="blue"
                  onSelectedDateChanged={setExpiryDate} />
                </div>
              </div>
              <div className="items-center rounded-b border-t border-gray-200 p-6 text-end dark:border-gray-700">
                <button className="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SetQuizExpiryModal;
