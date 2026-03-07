import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable instrumentation hook (src/instrumentation.ts) for startup migrations
  instrumentationHook: true,
  serverExternalPackages: ["@node-rs/argon2"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
  webpack(config, { isServer }) {
    // @node-rs/argon2 ships a browser.js that tries to import the WASM target,
    // which is not installed. In the Edge / client bundles webpack resolves the
    // "browser" field, causing a build failure. We alias it to an empty module
    // because argon2 is only needed at runtime inside the server-only
    // `authorize` callback; the Edge middleware only uses NextAuth's JWT helper.
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@node-rs/argon2": false,
      };
    }
    // Edge runtime also hits the browser field — catch it via fallback
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@node-rs/argon2-wasm32-wasi": false,
    };
    return config;
  },
};

export default nextConfig;
