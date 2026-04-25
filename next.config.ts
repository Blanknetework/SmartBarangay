import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow opening dev server from Tailscale/private-network host in development.
  // Update this value if your Tailscale IPv4 changes.
  allowedDevOrigins: ["100.93.39.88"],

  // Prevent Turbopack from inferring a higher parent folder as workspace root.
  turbopack: {
    root: process.cwd(),
  },

  /* Information Assurance: Strict Security Headers */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Blocks Clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Prevents MIME-sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // Protects referral data
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains', // Enforces HTTPS
          },
        ],
      },
    ];
  },
};

export default nextConfig;
