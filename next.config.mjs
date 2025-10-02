/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Note: Some Supabase type assertions use 'as any' due to complex type inference
    // These are safe as data matches database schema. Consider this acceptable for now.
    ignoreBuildErrors: false,
  },
  eslint: {
    // ESLint errors will block production builds
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;
