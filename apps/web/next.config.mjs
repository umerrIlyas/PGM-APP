/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@pgm/ui', '@pgm/utils'],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
