"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");

  const [showWelcome, setShowWelcome] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if(username === "admin" && password === "admin") {
      setShowWelcome(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } else {
      alert("Invalid credentials. Try admin / admin");
    }
  };

  return (
    <>
      <div className="flex min-h-screen w-full bg-[#f2f6f9] font-sans items-center justify-center py-10">
        <div className="flex flex-col items-center w-full max-w-[480px] px-6">
        
        {/* Branding Area at the top */}
        <div className="flex flex-col items-center justify-center text-center w-full -mb-8">
          <div className="w-[340px] h-[340px] flex items-center justify-center">
             <Image src="/Barangay1.png" alt="Barangay Logo" width={340} height={340} className="object-contain" priority />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-[32px] tracking-[0.1em] text-[#3e4856] font-mono" style={{ fontFamily: "monospace, sans-serif" }}>Sign-in</h2>
        </div>

        {/* Form Box - Exactly like the layout they approved earlier */}
        <div className="w-full bg-transparent border-[1.5px] border-[#393939] rounded-2xl px-10 py-12 sm:px-12 sm:py-14">
          <form onSubmit={handleLogin} className="space-y-10">
            <div className="space-y-1">
              <input
                type="text"
                placeholder="Username"
                className="w-full pb-2 pt-2 border-b-[1.5px] border-gray-300 bg-transparent text-gray-800 focus:outline-none focus:border-[#0e88c7] transition-colors placeholder:text-gray-400 placeholder:font-medium placeholder:text-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <input
                type="password"
                placeholder="Password"
                className="w-full pb-2 pt-2 border-b-[1.5px] border-gray-300 bg-transparent text-gray-800 focus:outline-none focus:border-[#0e88c7] transition-colors placeholder:text-gray-400 placeholder:font-medium placeholder:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-[#0e88c7] hover:bg-[#0c73a8] text-white rounded-lg py-3 font-semibold text-base transition-all"
              >
                Login
              </button>
            </div>
          </form>
        </div>

        {/* Forgot Password */}
        <div className="mt-8 text-center bg-transparent">
          <button className="text-[#0e88c7] hover:underline font-semibold text-sm transition-colors cursor-pointer">
            Forgot Password?
          </button>
        </div>

        </div>
      </div>
      
      {/* Toast Notification */}
      {showWelcome && (
        <div className="fixed top-6 right-6 bg-white dark:bg-[#1E293B] shadow-xl rounded-xl flex items-center p-4 border border-green-100 dark:border-green-900/30 animate-in slide-in-from-top-4 fade-in duration-300 z-50">
          <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2 mr-4 flex-shrink-0">
            <CheckCircle2 className="text-green-600 dark:text-green-400" size={24} />
          </div>
          <div>
            <h4 className="text-slate-800 dark:text-slate-100 font-bold text-sm">Welcome!</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">You have successfully logged in.</p>
          </div>
        </div>
      )}
    </>
  );
}
