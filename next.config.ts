import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    compress: true,
    images: {
        qualities: [25, 50, 75, 100],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'i.ytimg.com',
            },
            {
                protocol: 'https',
                hostname: '*.tile.openstreetmap.org',
            }
        ],
    },
    compiler: {
        removeConsole: process.env.NODE_ENV === "production",
    },
};

export default nextConfig;
