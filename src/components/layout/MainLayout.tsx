"use client";

import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:ml-0">
                {/* Header */}
                <Header />

                {/* Main Content */}
                <main className="flex-1 min-h-0 pb-16 lg:pb-0">
                    <div className="h-full overflow-auto">{children}</div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
