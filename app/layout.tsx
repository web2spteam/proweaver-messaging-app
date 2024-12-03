import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { ThemeModeScript } from "flowbite-react";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

const APP_NAME = "Proweaver Messaging App";
const APP_DEFAULT_TITLE = "Proweaver Messaging";
const APP_TITLE_TEMPLATE = "%s | Proweaver Messaging";
const APP_DESCRIPTION =
  "This is a Proweaver Messaging Platform";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#f74e1f",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <ThemeModeScript />
        {/* New meta tag for mobile web app capability */}
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${poppins.className} bg-gray-50 text-black dark:bg-black dark:text-white`}>{children}</body>
    </html>
  );
}
