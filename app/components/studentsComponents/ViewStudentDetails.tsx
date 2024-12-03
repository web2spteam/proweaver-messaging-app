"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useModal } from "@/app/context/ModalContext";
import { getData } from "@/app/hooks/useAxios";
import {
  PencilSquareIcon,
  EnvelopeIcon,
  HomeIcon,
  PhoneIcon,
  UserCircleIcon,
  CakeIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import InitialsAvatar from "../InitialsAvatar";

interface IStudentData {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string | null;
  birthdate: string;
  gender: string;
  contact_number: string;
  street: string;
  barangay: string;
  city: string;
  date_added: string;
  status: string | number;
  file_path: string | null;
}

function ViewStudentDetails() {
  const { student_id } = useParams();
  const { openModal, isOpen } = useModal();

  const [firstName, setFirstName] = useState<string>("");
  const [midName, setMidName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [birthdate, setBirthDate] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [contactNum, setContactNum] = useState<string>("");
  const [email, setEmail] = useState<string | null>(null);
  const [street, setStreet] = useState<string>("");
  const [barangay, setBarangay] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [dateRegistered, setDateRegistered] = useState<string>("");
  const [status, setStatus] = useState<string | number>();
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        const studentData: IStudentData = await getData(
          `students/getStudentDetails/${student_id}`,
        );
        if (studentData) {
          setFirstName(studentData.first_name);
          setMidName(studentData.middle_name);
          setLastName(studentData.last_name);
          setEmail(studentData.email);
          setBirthDate(studentData.birthdate);
          setGender(studentData.gender);
          setContactNum(studentData.contact_number);
          setStreet(studentData.street);
          setBarangay(studentData.barangay);
          setCity(studentData.city);
          setDateRegistered(studentData.date_added);
          setStatus(studentData.status);
          setProfilePic(studentData.file_path);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchStudentInfo();
  }, [student_id]);

  return (
    <div className="py-4 md:py-8">
      <div className="mb-4 grid gap-4 sm:grid-cols-2 sm:gap-8 lg:gap-16">
        <div className="order-1 text-right sm:order-2">
          <button
            type="button"
            onClick={() => {
              if (typeof student_id === "string")
                openModal("editStudentModal", student_id);
            }}
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto"
          >
            <PencilSquareIcon className="-ms-0.5 me-1.5 size-4" />
            Edit Student Details
          </button>
        </div>

        {/* Avatar and account info div - second on mobile, first on desktop */}
        <div className="order-2 flex space-x-4 sm:order-1">
          {profilePic !== null ? (
            <Image
              src={profilePic}
              alt={`${firstName} ${lastName}`}
              className="size-16 rounded-lg"
            />
          ) : (
            <InitialsAvatar
              name={`${firstName} ${lastName}`}
              size={16}
              shape="rounded-lg"
              fontSize="2xl"
            />
          )}
          <div>
            <span
              className={`mb-2 inline-block rounded bg-blue-100 px-2.5 py-0.5 text-xs font-medium 
                            ${status == 0 && "text-gray-800 dark:bg-gray-900 dark:text-gray-300"}
                            ${status == 1 && "text-green-800 dark:bg-green-900 dark:text-green-300"}
                            ${status == 2 && "text-red-800 dark:bg-red-900 dark:text-red-300"}
                            `}
            >
              {status == 0 && "Newly Registered"}
              {status == 1 && "Active"}
              {status == 2 && "Disabled"}
            </span>
            <h2 className="flex items-center text-xl font-bold leading-none text-gray-900 dark:text-white sm:text-2xl">
              {firstName} {midName} {lastName}
            </h2>
          </div>
        </div>
      </div>
      <div className="mb-4 grid gap-4 sm:grid-cols-2 sm:gap-8 lg:gap-16">
        <div className="space-y-4">
          <dl className="">
            <dt className="font-semibold text-gray-900 dark:text-white">
              Email Address
            </dt>
            <dd className="text-gray-500 dark:text-gray-400">
              <EnvelopeIcon className="me-1 size-4 text-gray-400 dark:text-gray-500 lg:inline" />
              {email !== null ? email : <i className="text-sm">Not set yet.</i>}
            </dd>
          </dl>
          <dl>
            <dt className="font-semibold text-gray-900 dark:text-white">
              Home Address
            </dt>
            <dd className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <HomeIcon className="me-1 size-4 text-gray-400 dark:text-gray-500 lg:inline" />
              {street}, {barangay}, {city}
            </dd>
          </dl>
          <dl>
            <dt className="font-semibold text-gray-900 dark:text-white">
              Contact Number
            </dt>
            <dd className="text-gray-500 dark:text-gray-400">
              <PhoneIcon className="me-1 size-4 text-gray-400 dark:text-gray-500 lg:inline" />
              {contactNum}
            </dd>
          </dl>
        </div>
        <div className="space-y-4">
          <dl>
            <dt className="font-semibold text-gray-900 dark:text-white">
              Gender
            </dt>
            <dd className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <UserCircleIcon className="me-1 size-4 text-gray-400 dark:text-gray-500 lg:inline" />
              {gender !== "" ? (
                gender
              ) : (
                <i className="text-sm">Not mentioned.</i>
              )}
            </dd>
          </dl>
          <dl>
            <dt className="font-semibold text-gray-900 dark:text-white">
              Date of Birth
            </dt>
            <dd className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <CakeIcon className="me-1 size-4 text-gray-400 dark:text-gray-500 lg:inline" />
              {birthdate !== "" ? (
                birthdate
              ) : (
                <i className="text-sm">Not set yet.</i>
              )}
            </dd>
          </dl>
          <dl>
            <dt className="font-semibold text-gray-900 dark:text-white">
              Date Registered
            </dt>
            <dd className="text-gray-500 dark:text-gray-400">
              <CalendarIcon className="me-1 size-4 text-gray-400 dark:text-gray-500 lg:inline" />
              {dateRegistered}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

export default ViewStudentDetails;
