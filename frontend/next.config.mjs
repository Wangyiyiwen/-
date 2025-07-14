/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 允许外部访问
  experimental: {
    allowedRevalidateHeaderKeys: [],
  },
}

export default nextConfig
