"use client";
import { useBatchInfo } from "../studentsComponents/BatchInfo";
import { FC, useState, useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { getData, postData } from "@/app/hooks/useAxios";
import { useRouter, useParams } from "next/navigation";

// import Datepicker from 'flowbite-datepicker/Datepicker';
import { Datepicker } from "flowbite-react";

// import { Datepicker } from 'flowbite';
// import type { DatepickerOptions, DatepickerInterface } from 'flowbite';

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
  batch_id: string | number;
  first_name: string;
  middle_name: string;
  last_name: string;
  birthdate: string;
  gender: string;
  contact_number: string;
  street: string;
  barangay: string;
  city: string;
}

const AddStudentModal: FC<ModalProps> = ({ isOpen, onClose }) => {
  const { batch_id } = useBatchInfo();

  const [batchName, setBatchName] = useState(false);

  const [firstName, setFirstName] = useState<string>("");
  const [midName, setMidName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [birthdate, setBirthDate] = useState<Date | null>(null);
  const [gender, setGender] = useState<string>("");
  const [contactNum, setContactNum] = useState<string>("");
  const [street, setStreet] = useState<string>("");
  const [barangay, setBarangay] = useState<string>("");
  const [city, setCity] = useState<string>("");

  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );

  // const datepickerRef = useRef<HTMLInputElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchBatchInfo = async () => {
      try {
        const res: any = await getData(`batch/getBatchInfo/${batch_id}`);
        if (res) {
          setBatchName(res?.batch_name);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchBatchInfo();
  }, [batch_id]);

  if (!isOpen) return null;

  // const handleSchoolYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     setNewSchoolYear(e.target.value);
  // };

  // const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //     setSchoolYearId(Number(e.target.value));
  // };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Clear existing errors
    setErrorMessage(undefined);

    let formData: FormData = {
      batch_id: batch_id,
      first_name: firstName,
      middle_name: midName,
      last_name: lastName,
      birthdate: formatDate(birthdate),
      gender: gender,
      contact_number: contactNum,
      street: street,
      barangay: barangay,
      city: city,
    };

    try {
      const result = await postData<ApiResponse, any>(
        "students/addStudent",
        formData,
      );
      if (result.success) {
        onClose();
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      console.error("Error occurred adding batch: ", error);
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) {
      console.error("Date is undefined.");
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so add 1
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
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
        <div className="relative size-full max-w-4xl px-4 md:h-auto">
          {/* Modal content */}
          <div className="relative rounded-lg bg-white shadow dark:bg-gray-800">
            {/* Modal header */}
            <div className="flex items-start justify-between rounded-t border-b p-5 dark:border-gray-700">
              <h3 className="text-xl font-semibold dark:text-white">
                Add New Student to{" "}
                <span className="text-blue-500">{batchName}</span>
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
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label
                      htmlFor="first-name"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="first-name"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                      placeholder="Juan"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="mid-name"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Middle Name
                    </label>
                    <input
                      type="text"
                      id="mid-name"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                      placeholder="Garcia"
                      autoComplete="additional-name"
                      value={midName}
                      onChange={(e) => {
                        setMidName(e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="last-name"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="last-name"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                      placeholder="Dela Cruz"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                      }}
                    />
                  </div>
                  <div id="customDatePickerContainer">
                    <label
                      htmlFor="birthdate"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Date of Birth
                    </label>
                    <div className="relative max-w-sm">
                      <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5">
                        <svg
                          className="size-4 text-gray-500 dark:text-gray-400"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                        </svg>
                      </div>
                      <Datepicker
                        id="birthdate"
                        minDate={new Date(1990, 0, 1)}
                        maxDate={new Date(2023, 3, 30)}
                        color="blue"
                        onSelectedDateChanged={(date) => {
                          setBirthDate(date);
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="gender"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Gender
                    </label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => {
                        setGender(e.target.value);
                      }}
                      autoComplete="sex"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    >
                      <option hidden disabled>
                        Select Gender
                      </option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="contact_num"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      id="contact_num"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                      placeholder="+63987654321"
                      autoComplete="tel"
                      value={contactNum}
                      onChange={(e) => {
                        setContactNum(e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="street"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Purok/Street
                    </label>
                    <input
                      type="text"
                      id="street"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                      placeholder="Purok 2"
                      autoComplete="address-line1"
                      value={street}
                      onChange={(e) => {
                        setStreet(e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="street"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Barangay
                    </label>
                    <input
                      type="text"
                      id="street"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                      placeholder="Tuyan"
                      autoComplete="address-line2"
                      value={barangay}
                      onChange={(e) => {
                        setBarangay(e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="street"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Town/City
                    </label>
                    <input
                      type="text"
                      id="street"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                      placeholder="City of Naga"
                      autoComplete="address-level2"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                      }}
                    />
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

export default AddStudentModal;
