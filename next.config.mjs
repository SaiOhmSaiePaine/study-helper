/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      encoding: false,
    };
    return config;
  },
  // Add security headers for loading PDF.js worker from CDN
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' cdnjs.cloudflare.com; worker-src 'self' blob:; img-src 'self' blob: data:; connect-src 'self' blob: data:;"
          }
        ],
      }
    ];
  }
};

export default nextConfig; 