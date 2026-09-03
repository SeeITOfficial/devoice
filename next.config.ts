import type { NextConfig } from "next";
import { getServerConfig } from "@/lib/config";

const r2PublicUrl = getServerConfig().r2PublicUrl;
let r2Hostname = "";
try {
  r2Hostname = new URL(r2PublicUrl).hostname;
} catch (e) {
  console.warn("Invalid R2_PUBLIC_URL environment variable.");
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: r2Hostname ? [
      {
        protocol: "https",
        hostname: r2Hostname,
      },
    ] : [],
  },
};

export default nextConfig;