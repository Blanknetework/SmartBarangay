"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { Search, SlidersHorizontal, ShieldAlert, FileText } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import Link from "next/link";

interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  details: string;
  userEmail?: string;
  userUid?: string;
  timestamp?: any;
}

export default function AuditLogsPage() {
  const { role, isLoading } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [limitAmount, setLimitAmount] = useState<number>(50);
  const [hasMore, setHasMore] = useState<boolean>(true);
  
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterAction, setFilterAction] = useState<string>("All");
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);

  // Real-time listener for logs (gated for Admin only)
  useEffect(() => {
    if (role !== "admin") return;

    const q = query(
      collection(db, "audit_logs"),
      orderBy("timestamp", "desc"),
      limit(limitAmount)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedLogs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AuditLog[];
        setLogs(fetchedLogs);
        
        // If the query returns fewer documents than the limit, we've loaded all of them
        setHasMore(snapshot.docs.length === limitAmount);
      },
      (error) => {
        console.error("Firestore Error in audit logs subscription:", error);
      }
    );

    return () => unsubscribe();
  }, [role, limitAmount]);

  // Client-side filtering & search on the loaded dataset
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        (log.details || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.userEmail || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.performedBy || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchAction = filterAction === "All" || log.action === filterAction;
      
      return matchSearch && matchAction;
    });
  }, [logs, searchTerm, filterAction]);

  // Handle Load More
  const handleLoadMore = () => {
    setLimitAmount((prev) => prev + 50);
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-500 font-bold">
        Checking Authorization...
      </div>
    );
  }

  // 2. Role Gating (Admin only)
  if (role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-in fade-in duration-300">
        <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-full inline-flex items-center justify-center mb-4">
          <ShieldAlert className="text-red-600 dark:text-red-400 w-16 h-16" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Access Denied</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6 font-semibold">
          You do not have the required Role-Based Access Control (RBAC) privileges to view this section.
        </p>
        <Link 
          href="/dashboard"
          className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-2.5 px-6 rounded-lg transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Action badge colors helper
  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case "LOGIN":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50";
      case "LOGIN_FAILED":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50";
      case "ADD_OFFICIAL":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50";
      case "UPDATE_OFFICIAL":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50";
      case "DELETE_OFFICIAL":
        return "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/50";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="flex flex-col space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      
      {/* Title & Description */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-[#F9FAFB] tracking-tight">System Audit Logs</h1>
        <p className="text-sm font-medium text-slate-500 dark:text-[#9CA3AF] mt-1">
          Detailed log of administrative events, official updates, and login attempts for auditing.
        </p>
      </div>

      {/* Top Action Bar: Search & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          
          {/* Search Box */}
          <div className="flex bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg items-center px-4 py-2.5 w-full sm:w-[350px] lg:w-[450px] shadow-sm dark:shadow-none transition-colors">
            <Search size={18} className="text-slate-400 dark:text-[#9CA3AF] mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Search by user email, performer, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-sm w-full font-medium text-slate-700 dark:text-[#F9FAFB] placeholder:text-slate-400 dark:placeholder:text-[#9CA3AF]"
            />
          </div>

          {/* Action Filter */}
          <div className="relative w-full sm:w-auto shrink-0">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2 w-full sm:w-auto font-bold text-xs ${showFilterMenu || filterAction !== 'All' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-200' : 'text-slate-600 dark:text-[#9CA3AF] hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <SlidersHorizontal size={16} />
              <span>Action: {filterAction}</span>
            </button>
            
            {showFilterMenu && (
              <div className="absolute left-0 mt-2 w-52 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-10 overflow-hidden py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 mb-1">
                   Filter by Action
                </div>
                {["All", "LOGIN", "LOGIN_FAILED", "ADD_OFFICIAL", "UPDATE_OFFICIAL", "DELETE_OFFICIAL"].map((act) => (
                  <button 
                    key={act}
                    onClick={() => { setFilterAction(act); setShowFilterMenu(false); }}
                    className={`w-full text-left px-4 py-2 text-sm font-semibold transition-colors ${filterAction === act ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                  >
                    {act}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Audit Logs Table Container */}
      <div className="w-full bg-white dark:bg-[#1F2937] rounded-xl border border-slate-200 dark:border-[#374151] shadow-sm dark:shadow-none overflow-hidden transition-colors">
        <div className="overflow-x-auto w-full">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-[#111827]/50 border-b border-slate-200 dark:border-[#374151]">
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF] border-r border-slate-200 dark:border-[#374151] w-48">Timestamp</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF] border-r border-slate-200 dark:border-[#374151] w-36">Action</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF] border-r border-slate-200 dark:border-[#374151] w-56">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Details</th>
              </tr>
            </thead>
            
            <tbody>
              {filteredLogs.map((log, idx, arr) => (
                <tr 
                  key={log.id} 
                  className={`group ${idx !== arr.length - 1 ? "border-b border-slate-100 dark:border-[#374151]" : ""} hover:bg-slate-50 dark:hover:bg-[#374151]/30 transition-colors duration-150`}
                >
                  <td className="px-6 py-5.5 text-sm font-semibold text-slate-600 dark:text-[#9CA3AF] border-r border-slate-200 dark:border-[#374151]">
                    {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : "Just now"}
                  </td>
                  <td className="px-6 py-5.5 border-r border-slate-200 dark:border-[#374151]">
                    <span className={`px-2.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase ${getActionBadgeClass(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-5.5 text-sm font-bold text-slate-800 dark:text-[#F9FAFB] border-r border-slate-200 dark:border-[#374151] truncate max-w-xs" title={log.userEmail || log.performedBy}>
                    {log.userEmail || log.performedBy}
                  </td>
                  <td className="px-6 py-5.5 text-sm font-medium text-slate-600 dark:text-[#D1D5DB] whitespace-normal break-all">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className="p-12 text-center text-slate-500 dark:text-[#9CA3AF] text-sm font-medium flex flex-col items-center justify-center space-y-3">
              <FileText size={40} className="text-slate-300 dark:text-slate-600" />
              <span>No system audit logs found matching your criteria.</span>
            </div>
          )}
        </div>
      </div>

      {/* Load More Button */}
      {hasMore && filteredLogs.length > 0 && (
        <div className="flex justify-center pt-2">
          <button 
            onClick={handleLoadMore}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#374151] dark:hover:bg-[#4B5563] text-slate-800 dark:text-[#F9FAFB] text-xs font-bold rounded-lg border border-slate-200 dark:border-[#4B5563] transition-colors"
          >
            Load Older Logs
          </button>
        </div>
      )}

    </div>
  );
}
