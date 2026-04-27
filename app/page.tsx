"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { CheckCircle2, ShieldCheck, Loader2, ShieldAlert, XCircle } from "lucide-react";
import { useAuth, Role } from "@/components/auth-provider";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { addAuditLog } from "@/lib/audit-log";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY = "smartbarangay_login_attempts";

function getAttemptData() {
  if (typeof window === "undefined") return { count: 0, lockedUntil: 0 };
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"count":0,"lockedUntil":0}');
  } catch { return { count: 0, lockedUntil: 0 }; }
}

function setAttemptData(data: { count: number; lockedUntil: number }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setRole } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showWelcome, setShowWelcome] = useState(false);
  const [showTimeoutAlert, setShowTimeoutAlert] = useState(false);
  const [showError, setShowError] = useState(false);

  // Lockout state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Initialize and check lockout on mount
  useEffect(() => {
    const data = getAttemptData();
    const now = Date.now();
    if (data.lockedUntil > now) {
      setIsLocked(true);
      setLockoutSeconds(Math.ceil((data.lockedUntil - now) / 1000));
    }
    setFailedAttempts(data.count);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isLocked) return;
    const interval = setInterval(() => {
      const data = getAttemptData();
      const remaining = Math.ceil((data.lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setIsLocked(false);
        setLockoutSeconds(0);
        setFailedAttempts(0);
        setAttemptData({ count: 0, lockedUntil: 0 });
      } else {
        setLockoutSeconds(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isLocked]);

  useEffect(() => {
    if (searchParams.get("reason") === "timeout") {
      setShowTimeoutAlert(true);
      window.history.replaceState(null, "", "/");
      setTimeout(() => setShowTimeoutAlert(false), 5000);
    }
  }, [searchParams]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const recordFailedAttempt = () => {
    const data = getAttemptData();
    const newCount = data.count + 1;
    let lockedUntil = data.lockedUntil;

    if (newCount >= MAX_ATTEMPTS) {
      lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      setIsLocked(true);
      setLockoutSeconds(Math.ceil(LOCKOUT_DURATION_MS / 1000));
    }

    setAttemptData({ count: newCount, lockedUntil });
    setFailedAttempts(newCount);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setIsLoading(true);

    const MOCK_ROLES: Record<string, Role> = {
      admin: "admin",
      inventory: "inventory",
      health: "health",
      finance: "finance",
      documents: "documents",
    };

    try {
      // Check mock users first — these don't go through Firebase Auth at all
      if (username in MOCK_ROLES) {
        if (password !== username) {
          // Wrong password for mock user — fail immediately, no Firebase call
          throw new Error("auth/wrong-password");
        }
        setRole(MOCK_ROLES[username]);
        await addAuditLog("LOGIN", username, `Mock user "${username}" logged in successfully.`);
        setAttemptData({ count: 0, lockedUntil: 0 });
        setFailedAttempts(0);
        setShowWelcome(true);
        setTimeout(() => router.push("/dashboard"), 1500);
        return;
      }

      // Real Firebase Auth for email-based users
      const userCredential = await signInWithEmailAndPassword(auth, username, password);
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setRole(userDocSnap.data().role as Role || "admin");
      } else {
        setRole("admin");
      }
      // Successful login — reset attempt counter
      await addAuditLog("LOGIN", userCredential.user.email || username, `Firebase user logged in successfully.`);
      setAttemptData({ count: 0, lockedUntil: 0 });
      setFailedAttempts(0);
      setShowWelcome(true);
      setTimeout(() => router.push("/dashboard"), 1500);

    } catch (error: any) {
      console.error("Login Error:", error);
      recordFailedAttempt();
      // Audit log the failed attempt
      await addAuditLog("LOGIN_FAILED", username, `Failed login attempt for "${username}". Error: ${error.code || error.message}`);
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const attemptsLeft = MAX_ATTEMPTS - failedAttempts;

  return (
    <>
      <div className="flex min-h-screen w-full bg-[#f2f6f9] font-sans items-center justify-center py-10">
        <div className="flex flex-col items-center w-full max-w-[480px] px-6">
        
        {/* Branding Area at the top */}
        <div className="flex flex-col items-center justify-center text-center w-full -mb-8">
          <div className="w-[340px] h-[340px] flex items-center justify-center">
             <Image src="/Barangay1.png" alt="Barangay Logo" width={340} height={340} className="object-contain" style={{ width: 'auto', height: '340px' }} priority />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-[32px] tracking-[0.1em] text-[#3e4856] font-mono" style={{ fontFamily: "monospace, sans-serif" }}>Sign-in</h2>
        </div>

        {/* Form Box */}
        <div className="w-full bg-transparent border-[1.5px] border-[#393939] rounded-2xl px-10 py-12 sm:px-12 sm:py-14">

          {/* Lockout Banner */}
          {isLocked && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in duration-300">
              <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-bold text-red-700">Account Temporarily Locked</p>
                <p className="text-xs text-red-500 mt-1">Too many failed attempts. Please wait before trying again.</p>
                <p className="text-lg font-black text-red-600 mt-2 font-mono">{formatCountdown(lockoutSeconds)}</p>
              </div>
            </div>
          )}

          {/* Attempts Warning (show after 1st fail, but not locked yet) */}
          {!isLocked && failedAttempts > 0 && failedAttempts < MAX_ATTEMPTS && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 animate-in fade-in duration-300">
              <ShieldAlert className="text-amber-500 shrink-0" size={16} />
              <p className="text-xs font-semibold text-amber-700">
                {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining before lockout
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-10">
            <div className="space-y-1">
              <input
                type="text"
                placeholder="Username (e.g. admin, inventory, health)"
                className="w-full pb-2 pt-2 border-b-[1.5px] border-gray-300 bg-transparent text-gray-800 focus:outline-none focus:border-[#0e88c7] transition-colors placeholder:text-gray-400 placeholder:font-medium placeholder:text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLocked}
                required
              />
            </div>
            <div className="space-y-1">
              <input
                type="password"
                placeholder="Password"
                className="w-full pb-2 pt-2 border-b-[1.5px] border-gray-300 bg-transparent text-gray-800 focus:outline-none focus:border-[#0e88c7] transition-colors placeholder:text-gray-400 placeholder:font-medium placeholder:text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLocked}
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || isLocked}
                className="w-full bg-[#0e88c7] hover:bg-[#0c73a8] text-white rounded-lg py-3 font-semibold text-base transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : isLocked ? `Locked — ${formatCountdown(lockoutSeconds)}` : "Login"}
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
      {/* Timeout Notification */}
      {showTimeoutAlert && (
        <div className="fixed top-6 right-6 bg-white dark:bg-[#1E293B] shadow-xl rounded-xl flex items-center p-4 border border-rose-100 dark:border-rose-900/30 animate-in slide-in-from-top-4 fade-in duration-300 z-50">
          <div className="bg-rose-100 dark:bg-rose-900/30 rounded-full p-2 mr-4 flex-shrink-0">
            <ShieldAlert className="text-rose-600 dark:text-rose-400" size={24} />
          </div>
          <div>
            <h4 className="text-slate-800 dark:text-slate-100 font-bold text-sm">Session Expired</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">You were logged out due to inactivity.</p>
          </div>
        </div>
      )}
      {/* Error Notification */}
      {showError && !isLocked && (
        <div className="fixed top-6 right-6 bg-white dark:bg-[#1E293B] shadow-xl rounded-xl flex items-center p-4 border border-red-100 dark:border-red-900/30 animate-in slide-in-from-top-4 fade-in duration-300 z-50">
          <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-2 mr-4 flex-shrink-0">
            <XCircle className="text-red-600 dark:text-red-400" size={24} />
          </div>
          <div>
            <h4 className="text-slate-800 dark:text-slate-100 font-bold text-sm">Login Failed</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Invalid username or password.</p>
          </div>
        </div>
      )}
      {/* Locked Notification Toast */}
      {showError && isLocked && (
        <div className="fixed top-6 right-6 bg-white dark:bg-[#1E293B] shadow-xl rounded-xl flex items-center p-4 border border-red-200 animate-in slide-in-from-top-4 fade-in duration-300 z-50">
          <div className="bg-red-100 rounded-full p-2 mr-4 flex-shrink-0">
            <ShieldAlert className="text-red-600" size={24} />
          </div>
          <div>
            <h4 className="text-slate-800 font-bold text-sm">Account Locked</h4>
            <p className="text-xs text-slate-500 mt-0.5">Too many failed attempts. Wait 5 minutes.</p>
          </div>
        </div>
      )}
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f2f6f9] flex items-center justify-center">Loading Data...</div>}>
      <LoginForm />
    </Suspense>
  );
}
