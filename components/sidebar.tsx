  "use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Stethoscope,
  CircleDollarSign,
  Package,
  ChevronLeft,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, Role } from "@/components/auth-provider";

export const navItems: { name: string, href: string, icon: any, allowedRoles: Role[] }[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, allowedRoles: ["admin", "inventory", "documents", "health", "finance"] },
  { name: "Residents Record", href: "/dashboard/residents", icon: Users, allowedRoles: ["admin", "documents", "health"] },
  { name: "Document Request", href: "/dashboard/documents", icon: FileText, allowedRoles: ["admin", "documents"] },
  { name: "Medical", href: "/dashboard/medical", icon: Stethoscope, allowedRoles: ["admin", "health"] },
  { name: "Financial Management", href: "/dashboard/financial", icon: CircleDollarSign, allowedRoles: ["admin", "finance"] },
  { name: "Inventory Management", href: "/dashboard/inventory", icon: Package, allowedRoles: ["admin", "inventory"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { role, isLoading } = useAuth();

  const filteredNavItems = navItems.filter((item) => {
    if (!role) return false;
    return item.allowedRoles.includes(role);
  });

  return (
    <aside
      className={cn(
        "bg-[#fcfdff] dark:bg-[#0F172A] min-h-[calc(100vh-5rem)] flex flex-col pt-6 hidden md:flex border-r border-slate-200 dark:border-[#374151] transition-all duration-300 relative",
        isCollapsed ? "w-20 items-center" : "w-64 lg:w-[280px]"
      )}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-full p-1 hover:bg-slate-50 dark:hover:bg-[#374151] z-50 shadow-sm text-slate-500 dark:text-[#9CA3AF] transition-transform hover:scale-110"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <nav className={cn("flex-1 space-y-2", isCollapsed ? "px-2" : "px-4")}>
        {!isCollapsed && (
          <div className="px-3 text-[10px] font-bold text-slate-400 dark:text-[#9CA3AF] uppercase tracking-widest mb-4 transition-opacity duration-300">
            Main Menu
          </div>
        )}
        
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                "flex items-center rounded-xl transition-all font-medium text-sm overflow-hidden",
                isCollapsed ? "justify-center p-3" : "space-x-3 px-3 py-3",
                isActive
                  ? "bg-[#3B82F6] text-white shadow-md shadow-[#3B82F6]/20 font-semibold"
                  : "bg-transparent text-slate-600 dark:text-[#F9FAFB] hover:bg-slate-100 dark:hover:bg-[#1F2937] hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Icon size={isCollapsed ? 22 : 18} className={cn(isActive ? "text-white" : "text-slate-400 dark:text-[#9CA3AF]", "shrink-0")} />
              
              {!isCollapsed && (
                <span className="whitespace-nowrap flex-1 transition-opacity duration-300">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {isCollapsed ? (
        <div className="p-4 mt-auto w-full flex justify-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1F2937] flex items-center justify-center text-slate-400 dark:text-[#9CA3AF] font-bold text-xs border dark:border-[#374151]" title="Need Help?">
              ?
            </div>
        </div>
      ) : (
        <div className="p-4 mt-auto">
          <div className="bg-slate-50 dark:bg-[#1F2937] p-4 rounded-xl border border-slate-100 dark:border-[#374151]">
            <p className="text-xs font-semibold text-slate-800 dark:text-[#F9FAFB] mb-1.5">Need help?</p>
            <p className="text-[10px] text-slate-500 dark:text-[#9CA3AF] mb-3 leading-relaxed">Check our docs for the latest updates.</p>
            <button className="w-full text-xs font-bold bg-white dark:bg-[#374151] text-[#3B82F6] dark:text-white py-2 rounded-lg transition-colors border border-slate-200 dark:border-[#374151] hover:bg-slate-50 dark:hover:bg-[#4B5563] shadow-sm dark:shadow-none">
              View Docs
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
