/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
    workerThreads: false,
    cpus: 1,
  },
};

module.exports = nextConfig;
