import type { NextRequest } from "next/server";
import { enforceAdminVpnAccess } from "@/lib/security/proxy";

export function proxy(request: NextRequest) {
  return enforceAdminVpnAccess(request);
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
