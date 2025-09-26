
/** @type {import('next').NextConfig} */
const nextConfig = {
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
        hostname: 'images.unsplash.com',
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
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/',
        permanent: false,
        has: [
          {
            type: 'cookie',
            key: 'user', // A placeholder, actual auth state is handled client-side
          },
        ],
      },
      {
        source: '/signup',
        destination: '/',
        permanent: false,
        has: [
          {
            type: 'cookie',
            key: 'user',
          },
        ],
      },
    ]
  },
};

module.exports = nextConfig;
