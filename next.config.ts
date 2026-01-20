import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3006/api/:path*', // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
