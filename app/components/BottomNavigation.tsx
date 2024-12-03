"use client";
import { useAuth } from "../context/AuthContext";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UserGroupIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  BellIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

function classNames(...classes: (string | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

const BottomNavigation = () => {
  const { userType } = useAuth();
  const pathName = usePathname();

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

  return (
    <>
      <nav className="fixed bottom-0 z-50 flex w-full justify-around bg-white p-4 shadow-md">
        {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={classNames(
              pathName === item.href
                ? "text-blue-500"
                : "text-gray-500 hover:text-blue-500",
              "flex flex-col items-center",
            )}
          >
            <item.icon className="mb-1 size-6" aria-hidden="true" />
          </a>
        ))}
      </nav>
    </>
  );
};

export default BottomNavigation;
