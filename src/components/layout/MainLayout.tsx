"use client";

import React from "react";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 lg:ml-0 min-h-screen pb-16 lg:pb-0">
                <div className="h-full overflow-auto">{children}</div>
            </main>
        </div>
    );
};

export default MainLayout;