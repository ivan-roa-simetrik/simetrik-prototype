import type { NextConfig } from "next";

// En el build para GitHub Pages se define NEXT_PUBLIC_BASE_PATH=/<repo> y NEXT_OUTPUT=export;
// en dev local ambas quedan vacías y el comportamiento no cambia.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  ...(process.env.NEXT_OUTPUT === "export" ? { output: "export" as const } : {}),
  ...(basePath ? { basePath } : {}),
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
