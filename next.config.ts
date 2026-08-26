import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          "pub-71513c69f62b46928cbe19efad2139b2.r2.dev",
      },
    ],
  },
};

export default nextConfig;