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
};

export default nextConfig;
