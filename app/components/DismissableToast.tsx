"use client";
import { useEffect, useState } from "react";
import { Toast } from "flowbite-react";
import { HiCheck, HiExclamation, HiX } from "react-icons/hi";

interface DismissableToastProps {
  type: string;
  message: string;
  onClose?: () => void; // Optional callback for when the toast is dismissed
}

export default function DismissableToast({
  type,
  message,
  onClose,
}: DismissableToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose(); // Call the onClose callback when the toast is dismissed
      }
    }, 3000); // 3 seconds

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, [onClose]);

  if (!isVisible) {
    return null; // Do not render the Toast if it's not visible
  }

  return (
    <Toast className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2">
      {type === "success" && (
        <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
          <HiCheck className="size-5" />
        </div>
      )}
      {type === "warning" && (
        <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-500 dark:bg-orange-800 dark:text-orange-200">
          <HiExclamation className="size-5" />
        </div>
      )}
      {type === "danger" && (
        <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
          <HiX className="size-5" />
        </div>
      )}
      <div className="ml-3 text-sm font-normal">{message}</div>
      <Toast.Toggle onClick={() => setIsVisible(false)} />
    </Toast>
  );
}
