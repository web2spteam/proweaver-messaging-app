"use client";
import { useState, useEffect } from "react";
import { useBatchInfo } from "@/app/components/studentsComponents/BatchInfo";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";

interface IBackToPrevButtonProps {
  href?: string;
  className?: string;
}

function BackToPrevButton({ href, className }: IBackToPrevButtonProps) {
  const { batch_slug } = useBatchInfo();
  const [backURL, setBackURL] = useState<string>(href ?? ""); // Initialize with the href or empty string

  useEffect(() => {
    if (!href) {
      setBackURL(`/dashboard/students/${batch_slug}`);
    }
  }, [href, batch_slug]);

  return (
    <a href={backURL} className={className}>
      <ArrowUturnLeftIcon className="mr-2 size-4" />
      Back
    </a>
  );
}

export default BackToPrevButton;
