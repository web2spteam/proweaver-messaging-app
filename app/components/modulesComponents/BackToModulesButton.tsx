"use client";
import { useState, useEffect } from "react";
import { useModuleInfo } from "./ModuleInfo";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

interface IBackToModulesButtonProps {
  href?: string;
  className?: string;
}

function BackToModulesButton({ href, className }: IBackToModulesButtonProps) {
  const { subject_id } = useModuleInfo();
  const [backURL, setBackURL] = useState<string>(href ?? ""); // Initialize with the href or empty string

  useEffect(() => {
    if (!href) {
      setBackURL(`/dashboard/subjects/${subject_id}`);
    }
  }, [href, subject_id]);

  return (
    <Link href={backURL} className={
        className
          ? className
          : "inline-flex items-center justify-center rounded-lg bg-gray-500 px-3 py-2 text-center text-sm font-medium text-white hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800 sm:w-auto"
      }>
      <ArrowUturnLeftIcon className="mr-2 size-4" />
      Back
    </Link>
  );
}

export default BackToModulesButton;
