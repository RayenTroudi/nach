/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    mdxRs: true,
    serverComponentsExternalPackages: ["mongoose"],
  },
  images: {
    domains: [
      "utfs.io",
      "img.clerk.com",
      "images.unsplash.com",
      "aceternity.com",
    ],
  },
  // Optimize build for Vercel
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
