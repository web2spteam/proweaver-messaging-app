import { AuthProvider } from "./context/AuthContext";
import AuthWrapper from "./components/auth/AuthWrapper";
import Image from "next/image";
import SignInForm from "./components/auth/SignInForm";
import landingPageImage from "@/public/landingpage.svg";

import { Metadata } from "next";
import { DarkThemeToggle } from "flowbite-react";

export const metadata: Metadata = {
  title: "Sign In | CollabLearn",
};

export default function Home() {
  return (
    <AuthProvider>
      <AuthWrapper>
        <div className="flex min-h-screen bg-white dark:bg-black">
          {/* Left side with form */}
          <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
            <div className="mx-auto w-full max-w-sm lg:w-96">
              <div>
                <Image
                  src="/promessageapp-logo.png"
                  width={80}
                  height={80}
                  alt="CollabLearn"
                />
                <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                  Sign in to <span className="text-red-500">Pro</span><span className="text-cyan-400">Messaging</span>
                </h2>
              </div>

              <div className="mt-8">
                <div>
                  <SignInForm />
                  <p className="mt-10 text-sm text-gray-500 dark:text-white">
                    Not registered yet?
                    <a
                      href="/sign-up"
                      className="ml-1 font-semibold leading-6 text-cyan-600 hover:text-cyan-500"
                    >
                      Sign Up
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side with image */}
          <div className="relative hidden w-0 flex-1 bg-gray-50 dark:bg-black lg:block">
            <Image
              src={landingPageImage}
              alt="Login Side Image"
              className="mx-auto size-[900px]"
              priority
            />
           
            <DarkThemeToggle className="fixed bottom-4 right-4 rounded-full p-3 dark:text-white" />
          </div>
        </div>
      </AuthWrapper>
    </AuthProvider>
  );
}
