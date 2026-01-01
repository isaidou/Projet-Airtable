"use client";

import Navbar from "@/components/Navbar";
import { Children } from "react";
export const Footer = () => {
    return (
        <footer className="w-full bg-white py-4 mt-8 border-t border-slate-200">
            <div className="container mx-auto text-center text-slate-500 text-sm">
                © {new Date().getFullYear()} - ESGI - Tous droits réservés
            </div>
        </footer>
    );
};
