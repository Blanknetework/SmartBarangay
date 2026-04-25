import type { NextRequest } from "next/server";

function normalizeIp(value: string | null): string | null {
  if (!value) return null;
  const raw = value.trim();
  if (!raw) return null;

  // Handle IPv4-mapped IPv6 values such as ::ffff:100.88.1.2
  return raw.startsWith("::ffff:") ? raw.slice(7) : raw;
}

function parseFirstIp(headerValue: string | null): string | null {
  if (!headerValue) return null;
  return normalizeIp(headerValue.split(",")[0] ?? null);
}

export function extractClientIp(request: NextRequest): string | null {
  /**
   * For middleware portability across environments, rely on proxy headers.
   * In many deployments, x-forwarded-for contains the original client IP.
   */
  return (
    parseFirstIp(request.headers.get("x-forwarded-for")) ??
    normalizeIp(request.headers.get("x-real-ip")) ??
    normalizeIp(request.headers.get("cf-connecting-ip")) ??
    null
  );
}

export function isTailscaleClientIp(ip: string | null): boolean {
  if (!ip) return false;
  if (!ip.startsWith("100.")) return false;

  // Tailscale commonly uses CGNAT range 100.64.0.0/10.
  const parts = ip.split(".");
  if (parts.length !== 4) return false;

  const octets = parts.map((part) => Number.parseInt(part, 10));
  if (octets.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return false;

  const [firstOctet, secondOctet] = octets;
  return firstOctet === 100 && secondOctet >= 64 && secondOctet <= 127;
}
