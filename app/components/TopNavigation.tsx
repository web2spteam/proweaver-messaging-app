"use client";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase/config";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import {
  Navbar,
  Dropdown,
  Avatar,
  Button,
  DarkThemeToggle,
} from "flowbite-react";
import {
  HomeIcon,
  UserGroupIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  BellIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import InitialsAvatar from "./InitialsAvatar";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getData } from "../hooks/useAxios";

interface IAccount {
  account_name: string;
  profile_pic?: string;
}

const TopNavigation = () => {
  const { user, userType } = useAuth();
  const router = useRouter();
  const pathName = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [accountInfo, setAccountInfo] = useState<IAccount | null>(null);

  let navigation = [{ name: "Dashboard", href: "/dashboard", icon: HomeIcon }];

  if (userType == 1) {
    navigation = [
      ...navigation,
      { name: "Students", href: "/dashboard/students", icon: UserGroupIcon },
      { name: "Subjects", href: "/dashboard/subjects", icon: BookOpenIcon },
      {
        name: "Assessments",
        href: "/dashboard/assessments",
        icon: ClipboardDocumentCheckIcon,
      },
      {
        name: "Reading Comprehension",
        href: "/dashboard/reading-comprehension-tests",
        icon: ClipboardDocumentListIcon,
      },
    ];
  } else {
    navigation = [
      ...navigation,
      { name: "Subjects", href: "/dashboard/subjects", icon: BookOpenIcon },
      { name: "My Progress", href: "/dashboard/my-progress", icon: ChartBarIcon },
    ];
  }

  const userNavigation = [{ name: "Your Profile", href: "#" }];

  useEffect(() => {
    // Detect mobile view
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Fetch user account info
    const fetchAccount = async () => {
      if (user) {
        try {
          const res: IAccount = await getData(
            `account/getAccountInfo/${user.uid}`,
          );
          if (res) {
            setAccountInfo(res);
          }
        } catch (error) {
          console.error("Error fetching account info:", error);
        }
      } else {
        console.error("No user is logged in");
      }
    };

    fetchAccount();
  }, [user]);

  if (!accountInfo) return null;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirect to login page after successful logout
      router.push("/");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <>
      {isMobile && (
        <Navbar fluid className="sticky top-0 z-50 bg-white p-4 shadow-md">
          <div className="flex w-full items-center justify-between">
            <Image src="/promessageapp-logo.png" alt="Logo" width={40} height={40} />
            <div className="flex items-center space-x-4">
              {/* <Button
                color="light"
                className="relative mr-2 size-11  rounded-full border-none bg-transparent hover:bg-gray-500 dark:bg-gray-800"
              >
                <BellIcon className="size-6 text-gray-800 dark:text-white" />
                <span className="sr-only">View notifications</span>
              </Button> */}
              <DarkThemeToggle className="mr-2 rounded-full p-3 dark:text-white" />
              <Dropdown
                arrowIcon={false}
                inline
                label={
                  accountInfo.profile_pic ? (
                    <Avatar
                      alt={accountInfo.account_name}
                      img={accountInfo.profile_pic}
                      rounded
                    />
                  ) : (
                    <InitialsAvatar name={accountInfo.account_name} />
                  )
                }
              >
                <Dropdown.Header>
                  <span className="block text-sm">
                    {accountInfo.account_name}
                  </span>
                  <span className="block truncate text-sm font-medium">
                    {user?.email}
                  </span>
                </Dropdown.Header>
                {userNavigation.map((item) => (
                  <Dropdown.Item key={item.name}>{item.name}</Dropdown.Item>
                ))}
                <Dropdown.Item onClick={handleLogout}>Sign Out</Dropdown.Item>
              </Dropdown>
            </div>
          </div>
        </Navbar>
      )}

      {!isMobile && (
        <div className="bg-gray-300 dark:bg-gray-800">
          <Navbar
            fluid
            className="mx-auto max-w-7xl bg-gray-300 px-4 dark:bg-gray-800 sm:px-6 lg:px-8"
          >
            <Navbar.Brand href="/">
              <Image src="/promessageapp-logo.png" alt="Logo" width={50} height={50} />
              <span className="ml-3 self-center whitespace-nowrap text-xl font-semibold dark:text-white">
                CollabLearn
              </span>
            </Navbar.Brand>

            <div className="flex md:order-2">
              {/* <Button
                color="light"
                className="relative mr-2 size-11  rounded-full border-none bg-transparent hover:bg-gray-500 dark:bg-gray-800"
              >
                <BellIcon className="size-6 text-gray-800 dark:text-white" />
                <span className="sr-only">View notifications</span>
              </Button> */}
              <DarkThemeToggle className="mr-2 rounded-full p-3 dark:text-white" />
              <Dropdown
                arrowIcon={false}
                inline
                label={
                  accountInfo.profile_pic ? (
                    <Avatar
                      alt={accountInfo.account_name}
                      img={accountInfo.profile_pic}
                      rounded
                    />
                  ) : (
                    <InitialsAvatar name={accountInfo.account_name} />
                  )
                }
              >
                <Dropdown.Header>
                  <span className="block text-sm">
                    {accountInfo.account_name}
                  </span>
                  <span className="block truncate text-sm font-medium">
                    {user?.email}
                  </span>
                </Dropdown.Header>
                {userNavigation.map((item) => (
                  <Dropdown.Item key={item.name}>{item.name}</Dropdown.Item>
                ))}
                <Dropdown.Item onClick={handleLogout}>Sign Out</Dropdown.Item>
              </Dropdown>
              <Navbar.Toggle />
            </div>

            <Navbar.Collapse>
              {navigation.map((item) => (
                <Navbar.Link
                  key={item.name}
                  href={item.href}
                  active={pathName === item.href}
                >
                  {item.name}
                </Navbar.Link>
              ))}
            </Navbar.Collapse>
          </Navbar>
        </div>
      )}
    </>
  );
};

export default TopNavigation;
