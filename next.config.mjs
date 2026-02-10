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
  webpack: (config, { isServer }) => {
    // Handle canvas for react-pdf
    if (isServer) {
      config.resolve.alias.canvas = false;
    }
    
    // Add fallback for pdfjs-dist
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      fs: false,
    };

    return config;
  },
  // Add CORS headers for API routes
  async headers() {
    return [
      {
        source: '/api/video-proxy',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, HEAD, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Range, Content-Type, Content-Length',
          },
          {
            key: 'Access-Control-Expose-Headers',
            value: 'Content-Range, Content-Length, Accept-Ranges',
          },
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
        ],
      },
    ];
  },
  // Optimize build for Vercel
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  // Disable CSS minification to prevent issues with Tailwind's group/name syntax
  productionBrowserSourceMaps: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
