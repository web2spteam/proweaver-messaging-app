// import { AuthProvider } from "../context/AuthContext";
// import AuthWrapper from "../components/auth/AuthWrapper";
// import TopNavigation from "../components/TopNavigation";
// import Footer from "../components/Footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <AuthProvider>
    //   <AuthWrapper>
        <div className="flex min-h-screen flex-col bg-black p-5">
          {/* <TopNavigation /> */}
          {children}
          {/* <Footer /> */}
        </div>
    //   </AuthWrapper>
    // </AuthProvider>
  );
}
