import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images:{
    remotePatterns:[
      {
        protocol:"https",
        hostname:"images.pexels.com",
      }
    ]
  }
};

export default nextConfig;
