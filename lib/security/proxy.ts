import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { extractClientIp, isTailscaleClientIp } from "@/lib/security/vpn-access";


const BLOCKED_MESSAGE =
  "403 Forbidden: Admin route requires Tailscale VPN access.";

export function enforceAdminVpnAccess(request: NextRequest) {
  const clientIp = extractClientIp(request);
  
  // Allow localhost for local development and testing
  const isLocalhost = clientIp === "127.0.0.1" || clientIp === "::1" || clientIp === null;
  const vpnAllowed = isTailscaleClientIp(clientIp) || isLocalhost;

  if (vpnAllowed) return NextResponse.next();


  return new NextResponse(BLOCKED_MESSAGE, {
    status: 403,
  });
}
