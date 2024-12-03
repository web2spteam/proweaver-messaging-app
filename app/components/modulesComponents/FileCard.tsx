import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { Dropdown } from 'flowbite-react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import pdfIcon from '@/public/pdf-svgrepo-com.svg';
import docIcon from '@/public/doc-svgrepo-com.svg';
import { HiOutlineDownload } from "react-icons/hi";

import { GrDocumentPdf, GrDocumentWord, GrImage } from "react-icons/gr";
import Link from 'next/link';
import { encodeBase64 } from '@/app/utils/zlib';
import { postData } from '@/app/hooks/useAxios';
import { useAuth } from '@/app/context/AuthContext';

interface FileCardProps {
    dataID: number;
    title: string;
    fileType: string;
    fileUrl: string;
    date: string;
    onDelete: () => void;
}

interface ApiResponse {
    success: boolean;
    message?: string;
}

const FileCard: React.FC<FileCardProps> = ({ dataID, title, fileType, fileUrl, date, onDelete }) => {
    const { userType } = useAuth();
    const { module_id } = useParams();

    const [deleteID, setDeleteID] = useState<number | undefined>(undefined);

    // Open the modal for single or bulk deletion
    const openDeleteModal = (material_id: number) => {
        setDeleteID(material_id); // Set the student ID(s) for deletion
    };

    // Close the modal
    const closeDeleteModal = () => {
        setDeleteID(undefined); // Reset the modal state
    };

    const deleteMaterial = async (material_id: number) => {
        try {
            const result = await postData<ApiResponse, any>(
                "module_materials/deleteMaterial",
                { material_id: material_id },
            );

            if (result.success) {
                closeDeleteModal(); // Close the modal after deletion
                onDelete();
            } else {
                console.error(result.message);
            }
        } catch (error) {
            closeDeleteModal();
            console.error("Error occurred deleting subject(s): ", error);
        }
    };
    return (
        <>
            <div className="rounded-lg border bg-white p-4 shadow-md">
                <div className="relative flex w-full items-center justify-stretch">
                    {/* Icon Column */}
                    <div className="shrink-0">
                        {fileType === "pdf" && <GrDocumentPdf size={28} className="text-red-600" />}
                        {(fileType === "doc" || fileType === "docx") && <GrDocumentWord size={28} className="text-blue-600" />}
                        {fileType === "jpg" && <GrImage size={28} className="text-gray-600" />}
                    </div>

                    {/* Title Column */}
                    <div className="w-3/4 grow ps-2">
                        <h3 className="truncate text-lg font-bold" title={title}>
                            {title}
                        </h3>
                    </div>
                    {/* Action Dropdown Column */}
                    <div className="shrink-0">
                        <Dropdown
                            arrowIcon={false}
                            inline
                            label={
                                <EllipsisVerticalIcon className='size-7' />
                            }
                        >
                            <Dropdown.Item className="w-44 px-4 py-2"><Link href={`/dashboard/modules/${module_id}/view-material?url=${encodeBase64(fileUrl)}&type=${fileType}`}>Open</Link></Dropdown.Item>
                            {/* <Dropdown.Item className="w-44 px-4 py-2">Edit Details</Dropdown.Item> */}
                            {userType != 2 && (
                            <Dropdown.Item
                                className="w-44 px-4 py-2"
                                onClick={() => openDeleteModal(dataID)}
                            >Delete</Dropdown.Item>
                            )}
                        </Dropdown>
                    </div>
                </div>
                <div className="group relative mt-5 h-40 w-full rounded-lg bg-gray-100 p-3">
                    {fileType === "pdf" && <Image src={pdfIcon} alt="Pdf Icon" className="mx-auto h-full" />}
                    {(fileType === "doc" || fileType === "docx") && <Image src={docIcon} alt="Document Icon" priority={true} className="mx-auto h-full" />}
                    {fileType === "jpg" && <Image src={fileUrl} width={100} height={100} alt="Image Icon" className="mx-auto h-full w-auto" />}

                    {/* Use the new download API route */}
                    <a href={`/api/download-file?fileUrl=${encodeURIComponent(fileUrl)}&fileName=${title}`} download>
                        <div className="absolute left-0 top-0 hidden size-full items-center justify-center rounded-lg bg-black/50 group-hover:flex">
                            <HiOutlineDownload className="size-10 text-white" />
                        </div>
                    </a>
                </div>


                <div className="mt-4 text-sm text-gray-500">
                    <p>Added: {date}</p>
                </div>
            </div>
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
                                Are you sure you want to delete this material?
                            </h3>
                            <button
                                onClick={() => deleteMaterial(deleteID)}
                                className="inline-flex items-center rounded-lg bg-red-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800"
                            >
                                Yes, I&#39;m sure
                            </button>
                            <button
                                onClick={closeDeleteModal}
                                className="ml-3 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                            >
                                No, cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FileCard;