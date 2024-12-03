import { Metadata } from "next";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Notifications from "../components/Notifications";
export const metadata: Metadata = {
    title: "Notifications",
};

export default function Dashboard() {
    return (
        <>
            <div className="border-b-2 border-b-white bg-black text-white">
                <h2 className="mb-3 text-3xl font-bold tracking-wider">COMMUNICATION CENTER</h2>
            </div>
            <div className="flex">
                <Sidebar />
                <Notifications />
            </div>
        </>
    );
}
