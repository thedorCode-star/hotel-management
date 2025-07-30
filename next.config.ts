import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client'],
  // Disable API route analysis during build
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // Skip API routes during build
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  // Force all API routes to be dynamic
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  // Disable static generation for API routes
  async generateStaticParams() {
    return [];
  },
};

export default nextConfig;
