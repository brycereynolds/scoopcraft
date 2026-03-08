import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep native Node packages out of the webpack bundle so their browser/wasm
  // fallbacks are never resolved (e.g. @node-rs/argon2 in middleware).
  serverExternalPackages: ["@node-rs/argon2"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        // Allow Pexels stock photos used as placeholders throughout the UI.
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
};

export default nextConfig;
