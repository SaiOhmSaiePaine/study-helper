/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Disable canvas in server-side rendering
    if (isServer) {
      config.resolve.alias.canvas = false;
    }

    // Handle PDF.js worker
    config.resolve.alias['pdfjs-dist'] = 'pdfjs-dist/legacy/build/pdf';

    return config;
  },
};

export default nextConfig; 