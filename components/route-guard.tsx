"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { navItems } from "./sidebar";
import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role, isLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!role) {
        // Not logged in, redirect to login
        router.push("/");
        return;
      }
      
      // Find the current route matching navItems
      // Note: we can also check prefixes if the route is /dashboard/inventory/item
      const matchedNavItem = navItems.find((item) => pathname.startsWith(item.href) && item.href !== "/dashboard");

      if (matchedNavItem) {
        if (!matchedNavItem.allowedRoles.includes(role)) {
          setIsAuthorized(false);
          return;
        }
      } else if (pathname !== "/dashboard" && pathname.startsWith("/dashboard")) {
          // If we are on /dashboard/something that is NOT in navItems, maybe allow? 
          // Or strictly deny. Let's strictly deny unless it's /dashboard exactly
          // Actually, let's keep it simple for the demo.
      }
      
      setIsAuthorized(true);
    }
  }, [pathname, role, isLoading, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center p-12 text-slate-500">Checking Authorization...</div>;
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-full inline-flex items-center justify-center mb-4">
          <ShieldAlert className="text-red-600 dark:text-red-400 w-16 h-16" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Access Denied</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
          You do not have the required Role-Based Access Control (RBAC) privileges to view this section.
        </p>
        <Link 
          href="/dashboard"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
