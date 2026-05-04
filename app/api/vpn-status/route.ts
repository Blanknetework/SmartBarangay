import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { extractClientIp, isTailscaleClientIp } from "@/lib/security/vpn-access";

export async function GET(request: NextRequest) {
  const clientIp = extractClientIp(request) || "127.0.0.1";
  const isVpn = isTailscaleClientIp(clientIp);

  return NextResponse.json({
    ipAddress: clientIp,
    isTailscaleVpn: isVpn,
    message: isVpn 
      ? "✅ Secure Connection: You are accessing this via the Barangay's Tailscale VPN."
      : "❌ Unsecured Connection: You are accessing this from a public or local IP. Admin actions would be blocked.",
  });
}
