"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { auth } from "@/lib/firebase";

export function AutoLogout() {
  const router = useRouter();
  const { role, setRole } = useAuth();

  useEffect(() => {
    if (!role) return; 


    const TIMEOUT_MS = 0.30 * 60 * 1000; 

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        auth.signOut().then(() => {
          localStorage.removeItem("smartbarangay_role");
          window.location.href = "/?reason=timeout";
        }).catch((err) => console.log(err));
      }, TIMEOUT_MS);
    };

    // my identifier if the user is active
    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    
    events.forEach((event) => window.addEventListener(event, resetTimer));
    
    // Initialize timer
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [role, router, setRole]);

  return null;
}
