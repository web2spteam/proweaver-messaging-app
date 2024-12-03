"use client";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import { usePathname, useRouter } from "next/navigation";

interface IBackButtonProps {
    className?: string;
    backTo?: string;
}

function BackButton({ className, backTo }: IBackButtonProps) {
    const pathName = usePathname();
    const router = useRouter();
    const handleBackClick = () => {
        let redirectTo;
    
        if (pathName.includes("edit-quiz") || pathName.includes("edit-test") || pathName.includes("take-quiz")) {
            // If "edit-quiz" is in the pathName, slice differently
            const splittedPath = pathName.split("/");
            redirectTo = splittedPath.slice(0, -2).join("/") || "/";
        } else {
            // Default behavior
            const splittedPath = pathName.split("/");
            redirectTo = splittedPath.slice(0, -1).join("/") || "/";
        }
    
        if (backTo === "module" || backTo === "read_compre") {
            localStorage.removeItem("quizItems");
            localStorage.removeItem("quizTitle");
            localStorage.removeItem("quizdescription");
            localStorage.removeItem("testItems");
            localStorage.removeItem("testTitle");
            localStorage.removeItem("testText");
        }
    
        router.push(redirectTo);
    };
    

    return (
        <button
            onClick={handleBackClick}
            className={
                className
                    ? className
                    : "inline-flex items-center justify-center rounded-lg bg-gray-500 px-3 py-2 text-center text-sm font-medium text-white hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800 sm:w-auto"
            }
        >
            <ArrowUturnLeftIcon className="mr-2 size-4" />
            Back
        </button>
    );
}

export default BackButton;
