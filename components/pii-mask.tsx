"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PIIMask({ value, type = "name" }: { value: string, type?: "name" | "id" | "default" }) {
  const [isVisible, setIsVisible] = useState(false);

  // Masking logic based on type
  const getMaskedValue = () => {
    if (!value) return "";
    
    if (type === "name") {
       // Mask all but first letter of each word (e.g., J*** D*** C***)
       return value.split(" ").map(w => w.charAt(0) + "•".repeat(Math.max(w.length - 1, 2))).join(" ");
    }
    if (type === "id") {
       return "•••-•••-" + value.slice(-4);
    }
    return "••••••••";
  };

  return (
    <div className="flex items-center gap-2 group">
      <span className={isVisible ? "" : "font-mono text-slate-500 tracking-wider"}>
        {isVisible ? value : getMaskedValue()}
      </span>
      <button 
        onClick={() => setIsVisible(!isVisible)}
        className="text-slate-300 opacity-0 group-hover:opacity-100 hover:text-blue-600 dark:hover:text-blue-400 transition-all focus:opacity-100"
        title={isVisible ? "Hide Secure Data" : "Reveal Secure Data"}
      >
        {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}
