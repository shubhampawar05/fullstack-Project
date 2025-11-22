import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Enable standalone output for Docker
  output: "standalone",
  // Set Turbopack root to fix workspace detection warning
  // "." means the directory containing this config file (frontend/)
  turbopack: {
    root: ".",
  },
};

export default nextConfig;
