import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yfin7gx5go.ufs.sh',
        pathname: '/f/**',
      },
    ],
  },
};

export default nextConfig;
