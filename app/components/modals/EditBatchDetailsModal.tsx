"use client";
import { FC, useState, useEffect } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { getData, postData } from "@/app/hooks/useAxios";
import { useRouter } from "next/navigation";

import DangerAlert from "../DangerAlert";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchID: string | number | undefined;
}

interface ApiResponse {
  success: boolean;
  message?: string;
}

interface FormData {
  batch_name: string;
  school_year_id?: number;
  school_year?: string;
}

const EditBatchDetailsModal: FC<ModalProps> = ({
  isOpen,
  onClose,
  batchID,
}) => {
  const router = useRouter();

  const [schoolYears, setSchoolYears] = useState<
    { school_year_id: number; school_year: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newSchoolYear, setNewSchoolYear] = useState<string>("");
  const [schoolYearId, setSchoolYearId] = useState<number | undefined>(
    undefined,
  );
  const [batchName, setBatchName] = useState<string>("");

  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );
  const [schoolYearError, setSchoolYearError] = useState<string | undefined>(
    "",
  );
  const [batchNameError, setBatchNameError] = useState<string | undefined>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchSchoolYears = async () => {
      try {
        const res: [] = await getData("batch/getSchoolYears");
        console.log(res);
        setSchoolYears(res);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSchoolYears();
  }, []);

  if (!isOpen) return null;
  const handleAddNew = () => {
    setIsAdding(true);
    setSchoolYearId(undefined);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewSchoolYear("");
  };

  const handleSchoolYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSchoolYear(e.target.value);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSchoolYearId(Number(e.target.value));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let isValid = true;

    // Clear existing errors
    setSchoolYearError(undefined);
    setBatchNameError(undefined);
    setErrorMessage(undefined);

    // Validate school year
    if (isAdding && !newSchoolYear) {
      setSchoolYearError("School year is required.");
      isValid = false;
    }

    if (!isAdding && !schoolYearId) {
      setSchoolYearError("School year is required.");
      isValid = false;
    }

    // Validate batch name
    if (!batchName) {
      setBatchNameError("Batch name is required.");
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    let formData: FormData = {
      batch_name: batchName,
    };

    if (schoolYearId) {
      formData.school_year_id = schoolYearId;
    } else {
      formData.school_year = newSchoolYear;
    }
    try {
      setIsLoading(true);
      const result = await postData<ApiResponse, any>(
        "batch/addBatch",
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
      console.error("Error occurred adding batch: ", error);
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
                Edit Batch Details
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
                <div className="grid grid-cols-6 gap-6">
                  <div className="relative col-span-6 sm:col-span-3">
                    {isAdding ? (
                      <>
                        <label
                          htmlFor="new-school-year"
                          className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                        >
                          School Year
                        </label>
                        <div className="flex items-center">
                          <input
                            type="text"
                            id="new-school-year"
                            value={newSchoolYear}
                            onChange={handleSchoolYearChange}
                            placeholder="Enter new school year"
                            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                          />
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="ml-2 inline-flex items-center justify-end rounded-lg bg-gray-100 p-2.5 text-center text-sm font-medium text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                          >
                            <XMarkIcon className="size-5" />
                            <span className="sr-only">Icon description</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <label
                          htmlFor="school-year"
                          className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                        >
                          School Year
                        </label>
                        <div className="flex items-center">
                          <select
                            id="school-year"
                            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                            onChange={handleSelectChange}
                            // disabled={loading}
                          >
                            <option value="" hidden>
                              Select School Year
                            </option>
                            {schoolYears.length > 0 ? (
                              schoolYears.map((item) => (
                                <option
                                  key={item.school_year_id}
                                  value={item.school_year_id}
                                >
                                  {item.school_year}
                                </option>
                              ))
                            ) : (
                              <option value="">
                                No school years available
                              </option>
                            )}
                          </select>
                          <button
                            type="button"
                            onClick={handleAddNew}
                            className="ml-2 inline-flex items-center justify-end rounded-lg bg-blue-100 p-2.5 text-center text-sm font-medium text-white hover:bg-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                          >
                            <PlusIcon className="size-5 text-gray-600" />
                          </button>
                        </div>
                      </>
                    )}
                    {schoolYearError && (
                      <p className="text-xs text-red-400">{schoolYearError}</p>
                    )}
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label
                      htmlFor="batch-name"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Batch Name
                    </label>
                    <input
                      type="text"
                      id="batch-name"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                      placeholder="Enter batch name"
                      value={batchName}
                      onChange={(e) => {
                        setBatchName(e.target.value);
                      }}
                    />
                    {batchNameError && (
                      <p className="text-xs text-red-400">{batchNameError}</p>
                    )}
                  </div>
                </div>
              </div>
              {/* Modal footer */}
              <div className="items-center rounded-b border-t border-gray-200 p-6 dark:border-gray-700">
                <button
                  className="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  type="submit"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditBatchDetailsModal;
