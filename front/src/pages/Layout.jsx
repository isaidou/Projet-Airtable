"use client";

import Navbar from "@/components/Navbar";
import { Footer } from "./Footer";
export const Layout = ({ children }) => {
    return (
        <div className="bg-white min-h-screen">
            <Navbar />
            <div className="min-h-screen">{children}</div>
            <Footer />
        </div>
    );
};
