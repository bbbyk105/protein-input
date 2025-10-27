import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/data/**",
      },
      {
        protocol: "https",
        hostname: "your-api-domain.com", // 本番環境のFastAPI URL
        pathname: "/data/**",
      },
    ],
    // 外部画像を最適化せずにそのまま表示する場合
    unoptimized: false,
  },
};

export default nextConfig;
