"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathName = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user && pathName !== "/") {
        // Redirect to login if user is not authenticated and not on the login page
        router.push("/");
      } else if (user && pathName === "/") {
        // Redirect to dashboard if user is authenticated and on the login page
        router.push("/notifications");
      }
    }
  }, [user, loading, router, pathName]);

  // Show loading spinner when authentication is in progress
  if (loading) {
    return (
      <div className="z-10 flex min-h-screen grow items-center justify-center">
        <div className="flex justify-center gap-2">
          <div className="size-4 animate-pulse rounded-full bg-blue-600"></div>
          <div className="size-4 animate-pulse rounded-full bg-blue-600"></div>
          <div className="size-4 animate-pulse rounded-full bg-blue-600"></div>
        </div>
      </div>
    );
  }

  // Allow access to the login page when not authenticated
  if (!user && pathName === "/") {
    return <>{children}</>;
  }

  // Prevent rendering children until redirect is resolved
  if (!user) {
    return null;
  }

  // Allow rendering children for authenticated users
  return <>{children}</>;
};

export default AuthWrapper;
