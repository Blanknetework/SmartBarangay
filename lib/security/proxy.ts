import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { extractClientIp, isTailscaleClientIp } from "@/lib/security/vpn-access";

/**
 * Smart Barangay admin access guard (network-layer aware).
 *
 * Tailscale creates private VPN addresses in the CGNAT range (100.64.0.0/10),
 * commonly seen as 100.x.x.x. This proxy simulates VPN-based remote access
 * control by allowing `/admin` only when the incoming IP appears to be from that
 * private range.
 *
 * Security note for project defense:
 * - Tailscale provides secure remote connectivity at the network layer.
 * - This proxy adds application-layer route protection on top of that network control.
 */

const BLOCKED_MESSAGE =
  "403 Forbidden: Admin route requires Tailscale VPN access.";

export function enforceAdminVpnAccess(request: NextRequest) {
  const clientIp = extractClientIp(request);
  const vpnAllowed = isTailscaleClientIp(clientIp);

  if (vpnAllowed) return NextResponse.next();

  // Deny non-VPN traffic to admin routes.
  // If you prefer redirect behavior for UX, switch to:
  // return NextResponse.redirect(new URL("/login", request.url));
  return new NextResponse(BLOCKED_MESSAGE, {
    status: 403,
  });
}
