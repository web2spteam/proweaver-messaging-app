"use client";
import { useEffect, useState, useCallback } from "react";
import { useModal } from "../../context/ModalContext";
import { useParams } from "next/navigation";
import BatchListSkeleton from "../../components/skeletons/BatchListSkeleton";
import FileCard from "../../components/modulesComponents/FileCard";
import ModalButton from "../ModalButton";
import { PlusIcon } from "@heroicons/react/24/outline";
import { getData } from "../../hooks/useAxios";
import { useAuth } from "@/app/context/AuthContext";

interface ApiResponse {
    success: boolean;
    message?: string;
}

function LearningMaterials() {
    const { userType } = useAuth();
    const { openModal, isOpen } = useModal();
    const { module_id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [moduleMaterials, setModuleMaterials] = useState<
        {
            material_id: number;
            material_name: string;
            material_details: string;
            date_added: string;
        }[]
    >([]);

    const fetchModuleMaterials = useCallback(async () => {
        try {
            const res: [] = await getData(
                `module_materials/getModuleMaterials/${module_id}`,
            );
            if (res) {
                setModuleMaterials(res);
            }
        } catch (error) {
            console.error("An error occurred fetching module materials:", error);
        } finally {
            setIsLoading(false);
        }
    }, [module_id]);

    const refreshModuleMaterials = useCallback(async () => {
        setIsLoading(true);
        await fetchModuleMaterials();
    }, [fetchModuleMaterials]);

    useEffect(() => {
        fetchModuleMaterials();
    }, [fetchModuleMaterials]);

    useEffect(() => {
        if (!isOpen) {
            refreshModuleMaterials();
        }
    }, [isOpen, refreshModuleMaterials]);

    return (
        <>
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium tracking-tight text-gray-700 dark:text-white/75">
                    Learning Materials
                </h2>
                {userType != 2 && (

                <div className="flex justify-end py-4">
                    <ModalButton
                        modalType="addNewMaterial"
                        onClose={() => refreshModuleMaterials()}
                        className="flex items-center justify-center rounded-lg bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                        <PlusIcon className="mr-2 size-5" />
                        Add New
                    </ModalButton>
                </div>)}
            </div>

            {isLoading ? (
                <BatchListSkeleton />
            ) : moduleMaterials.length > 0 ? (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {moduleMaterials.map((item) => {
                        try {
                            const materialDetails = JSON.parse(item.material_details);
                            return (
                                <FileCard
                                    key={item.material_id}
                                    dataID={item.material_id}
                                    title={item.material_name}
                                    fileType={materialDetails.file_type}
                                    fileUrl={`https://collablearn.dworks.online/api/v1/${materialDetails.file_path}`}
                                    date={item.date_added}
                                    onDelete={refreshModuleMaterials}
                                />
                            );
                        } catch (error) {
                            console.error("Invalid JSON in material_details:", error);
                            return null; // Skip rendering for invalid items
                        }
                    })}
                </div>
            ) : (
                <div
                    className="flex items-center rounded-lg border border-gray-300 bg-gray-50 p-4 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    role="alert"
                >
                    <svg
                        className="me-3 inline size-4 shrink-0"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                    </svg>
                    <span className="sr-only">Info</span>
                    <div>
                        <span className="font-medium">
                            No module materials have been added yet.
                        </span>
                        <a
                            className="ml-1 cursor-pointer font-normal text-blue-600 hover:underline dark:text-blue-500"
                            onClick={() => openModal("addNewMaterial")}
                        >
                            Add New
                        </a>
                    </div>
                </div>
            )}
        </>
    );
}

export default LearningMaterials;
