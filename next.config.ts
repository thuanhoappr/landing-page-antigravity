import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/api/download/cam-nang": ["./public/downloads/Cam-nang-Pickleball-Newbie.pdf"],
  },
  async rewrites() {
    return [
      {
        source: "/downloads/Cam-nang-Pickleball-Newbie.pdf",
        destination: "/api/download/cam-nang",
      },
    ];
  },
};

export default nextConfig;
