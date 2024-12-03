"use client";
import { FC, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { postFormData } from "@/app/hooks/useAxios";
import { useRouter, useParams } from "next/navigation";

import { Label, Radio, FileInput } from "flowbite-react";

import DangerAlert from "../DangerAlert";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  materialNameError?: string;
  fileError?: string;
}

interface FormData {
  subject_id: string | number | string[];
  module_title: string;
}

const AddNewMaterialModal: FC<ModalProps> = ({ isOpen, onClose }) => {
  const { module_id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [materialName, setMaterialName] = useState<string>("");
  const [materialType, setMaterialType] = useState<string>("File");
  const [videoLink, setVideoLink] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );
  const [materialNameError, setMaterialNameError] = useState<
    string | undefined
  >("");
  const [fileError, setFileError] = useState<string | undefined>("");
  const [videLinkError, setVideLinkError] = useState<string | undefined>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let isValid = true;
    const formData = new FormData();
    if (module_id && typeof module_id == "string") {
      formData.append("module_id", module_id);
    }
    formData.append("material_type", materialType);

    // Clear existing error
    setMaterialNameError(undefined);
    setErrorMessage(undefined);

    // Validate batch name
    if (!materialName) {
      setMaterialNameError("Material name is required.");
      isValid = false;
    } else {
      formData.append("material_name", materialName);
    }

    if (materialType == "File") {
      if (file) {
        formData.append("file", file); // append file to the form data
      } else {
        setFileError("You haven't selected a file.");
        isValid = false;
      }
    } else {
      if (!materialName) {
        setVideLinkError("Video link is required.");
        isValid = false;
      } else {
        formData.append("video_link", videoLink);
      }
    }

    if (!isValid) {
      return;
    }

    try {
      setIsLoading(true);
      const result = await postFormData<ApiResponse>(
        "module_materials/addModuleMaterial",
        formData,
      );
      if (result.success) {
        onClose();
      } else {
        setIsLoading(false);
        if(result.materialNameError){
            setMaterialNameError(result.materialNameError)
        } else if(result.fileError){
            setFileError(result.fileError)
        } else {
            setErrorMessage(result.message);
        } 
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      console.error("Error occurred adding module material: ", error);
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
                Add New Learning Material
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
                      htmlFor="material-name"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Material Name
                    </label>
                    <input
                      type="text"
                      id="material-name"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                      placeholder="Enter material name"
                      value={materialName}
                      onChange={(e) => {
                        setMaterialName(e.target.value);
                      }}
                    />
                    {materialNameError && (
                      <p className="text-xs text-red-400">
                        {materialNameError}
                      </p>
                    )}
                  </div>
                  {/* <div className="col-span-1 sm:col-span-3">
                    <fieldset className="flex max-w-md flex-row gap-4">
                      <legend className="mb-4">Choose material type</legend>
                      <div className="flex items-center gap-2">
                        <Radio
                          id="file-material"
                          name="material_type"
                          value="File"
                          onChange={(e) => setMaterialType(e.target.value)}
                          defaultChecked
                        />
                        <Label htmlFor="file-material">File</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Radio
                          id="video-material"
                          name="material_type"
                          value="Video"
                          onChange={(e) => setMaterialType(e.target.value)}
                        />
                        <Label htmlFor="video-material">Video</Label>
                      </div>
                    </fieldset>
                  </div> */}
                  <div className="col-span-1 sm:col-span-3">
                    {materialType === "File" ? (
                      <>
                        <div id="fileUpload" className="max-w-full">
                          <div className="mb-2 block">
                            <Label htmlFor="file" value="Upload file" />
                          </div>
                          <FileInput
                            id="file"
                            name="file"
                            onChange={handleFileChange}
                            helperText="File size must not be greater than 2MB. Accepted file types: .png, .jpeg, .pdf, .doc, .docx"
                            accept=".png, .jpg, .jpeg, .pdf, .doc, .docx"
                          />
                        </div>
                        {fileError && (
                          <p className="text-xs text-red-400">{fileError}</p>
                        )}
                      </>
                    ) : (
                      <>
                        <label
                          htmlFor="material-name"
                          className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Video Link
                        </label>
                        <input
                          type="text"
                          id="video-link"
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                          placeholder="Enter a YouTube or Vimeo link"
                          // value={moduleTitle}
                          name="video_link"
                          onChange={(e) => {
                            setVideoLink(e.target.value);
                          }}
                        />
                        {videLinkError && (
                          <p className="text-xs text-red-400">
                            {videLinkError}
                          </p>
                        )}
                      </>
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

export default AddNewMaterialModal;
