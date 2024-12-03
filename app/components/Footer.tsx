"use client";
import { useEffect, useState } from "react";
import BottomNavigation from "./BottomNavigation";

export default function Footer() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile view
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {isMobile ? (
        <BottomNavigation />
      ) : (
        <footer className="fixed bottom-0 z-0 w-full border-t border-gray-200 bg-white p-4 shadow dark:border-gray-600 dark:bg-gray-800 md:flex md:items-center md:justify-center md:p-6">
          <span className="text-sm text-gray-500 dark:text-gray-400 sm:text-center">
            © 2024{" "}
            <a href="https://flowbite.com/" className="hover:underline">
              CollabLearn™
            </a>
            . All Rights Reserved.
          </span>
        </footer>
      )}
    </>
  );
}
