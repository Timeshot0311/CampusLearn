
import type {NextConfig} from 'next';
import withPWAInit from "@ducanh2912/next-pwa";

const isTurbopack = process.env.TURBOPACK;

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

// Disable PWA when using Turbopack, as it's not yet supported.
export default isTurbopack ? nextConfig : withPWA(nextConfig);
