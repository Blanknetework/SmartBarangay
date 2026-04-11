"use client";

import { Bell, Search, Settings, User, Moon, Sun } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-20 w-full bg-[#fcfdff] dark:bg-[#0F172A] flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm border-b border-slate-200 dark:border-[#374151] transition-colors">
      {/* Left section: Logo and dark text */}
      <div className="flex items-center space-x-3 w-64 lg:w-[320px]">
        <Image src="/Barangay1.png" alt="Barangay Logo" width={60} height={60} className="object-contain shrink-0" priority />
        <div className="flex flex-col justify-center hidden sm:flex transition-colors">
          <span className="font-black text-[15px] tracking-tighter text-slate-900 dark:text-[#F9FAFB] leading-none transition-colors">
            SMARTBARANGAY
          </span>
          <span className="text-[7.5px] font-bold text-slate-700 dark:text-[#9CA3AF] mt-[2px] uppercase leading-tight tracking-wider transition-colors">
            Integrated Barangay Management &amp;<br/>Service Information System
          </span>
        </div>
      </div>

      {/* Middle section space filler to push icons to the right */}
      <div className="flex-1"></div>

      {/* Right section: Icons */}
      <div className="flex items-center space-x-2 md:space-x-4 pl-4">
        {mounted && (
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#1F2937] text-slate-500 dark:text-[#9CA3AF] transition-colors"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}
        <button className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#1F2937] text-slate-500 dark:text-[#9CA3AF] transition-colors">
          <Settings size={20} />
        </button>
        <button className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#1F2937] text-slate-500 dark:text-[#9CA3AF] transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-[8px] right-[8px] w-2.5 h-2.5 bg-[#EF4444] border-[2px] border-[#fcfdff] dark:border-[#0F172A] rounded-full box-content"></span>
        </button>
        <div className="h-6 w-px bg-slate-200 dark:bg-[#374151] mx-2 hidden sm:block"></div>
        <button className="relative w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1F2937] flex items-center justify-center border border-slate-200 dark:border-[#374151] hover:ring-2 hover:ring-slate-200 transition-all overflow-hidden ml-1 shadow-sm dark:shadow-none">
           <User size={18} className="text-slate-600 dark:text-[#F9FAFB]" />
           <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C55E] border-[1.5px] border-[#fcfdff] dark:border-[#0F172A] rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
