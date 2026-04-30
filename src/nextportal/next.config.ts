import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // produces .next/standalone/ with a minimal self-contained server - required for the multi-stage container build
  output: "standalone",
};

export default nextConfig;
