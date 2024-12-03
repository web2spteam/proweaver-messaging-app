"use client";
import { useState, useEffect } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";

import { useRouter } from "next/navigation";
import { Alert } from "flowbite-react";
import { HiX } from "react-icons/hi";

function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [signInWithEmailAndPassword, user, loading, error] = useSignInWithEmailAndPassword(auth);

  useEffect(() => {
    let isMounted = true;

    if (user && isMounted) {
      router.push("/notifications");
    }

    return () => {
      isMounted = false;
    };
  }, [user, router]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission behavior

    try {
      const res = await signInWithEmailAndPassword(email, password);

      if (res) {
        setEmail("");
        setPassword("");
        await router.push("/notifications"); // Redirect after successful sign-in
      } else {
        console.error("Failed to sign in.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error signing in:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  return (
    <>
      <form className="space-y-6" method="POST" onSubmit={handleSignIn}>
        {error && (
          <Alert color="failure" icon={HiX}>
            {error.code === "auth/invalid-credential" &&
              "Invalid login credentials"}
          </Alert>
        )}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-50"
          >
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="juandelacruz@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full appearance-none rounded-md border border-gray-300 bg-transparent px-3 py-2 shadow-sm placeholder:text-gray-400 focus:border-[#644d9f] focus:outline-none focus:ring-[#644d9f] sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-50"
          >
            Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full appearance-none rounded-md border border-gray-300 bg-transparent px-3 py-2 shadow-sm placeholder:text-gray-400 focus:border-[#644d9f] focus:outline-none focus:ring-[#644d9f] sm:text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="size-4 rounded border-gray-300 text-[#644d9f] focus:ring-[#644d9f]"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-900 dark:text-gray-50"
            >
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a
              href="#"
              className="font-medium text-[#f74e1f] hover:text-[#644d9f]"
            >
              Forgot your password?
            </a>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="flex w-full justify-center rounded-md border border-transparent bg-[#644d9f] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#f74e1f] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:hover:border-[#644d9f]"
          >
            Sign in
          </button>
        </div>
      </form>
    </>
  );
}

export default SignInForm;
