import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/v1/:path*",
        destination: "http://192.168.100.5:11434/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
